// static/src/js/pos_qz_tray.js
odoo.define('pos_qz_tray.Integration', function(require) {
    'use strict';
    const models = require('point_of_sale.models');
    const PosModel = models.PosModel;
    // Asegurar que los campos de QZ Tray se carguen en el POS frontend
    models.load_fields('pos.config', ['qz_tray_host', 'qz_default_printer']);
    models.load_fields('pos.printer', ['qz_printer_name']);

    // Extender la inicialización del POS para conectar QZ Tray y mostrar las impresoras
    const SuperInitialize = PosModel.prototype.initialize;
    PosModel.prototype.initialize = function (session, attributes) {
        const result = SuperInitialize.call(this, session, attributes);
        const host = this.config.qz_tray_host || 'localhost';
        if (host) {
            // Conectar a QZ Tray y listar impresoras disponibles
            setTimeout(async () => {
                try {
                    await qz.websocket.connect({ host: host });
                    const printers = await qz.printers.find();  // obtiene lista de nombres de impresoras
                    // Crear UI de selección de impresora y botón de prueba
                    const container = document.createElement('div');
                    container.style.position = 'fixed';
                    container.style.bottom = '10px';
                    container.style.right = '10px';
                    container.style.padding = '5px';
                    container.style.background = '#f0f0f0';
                    container.style.border = '1px solid #ccc';
                    container.style.zIndex = '1000';

                    const select = document.createElement('select');
                    select.style.marginRight = '8px';
                    printers.forEach(name => {
                        const opt = document.createElement('option');
                        opt.value = name;
                        opt.textContent = name;
                        select.appendChild(opt);
                    });
                    // Seleccionar la impresora por defecto configurada si existe
                    if (this.config.qz_default_printer) {
                        select.value = this.config.qz_default_printer;
                    }

                    const btn = document.createElement('button');
                    btn.textContent = 'Print Test';
                    btn.style.padding = '2px 8px';
                    btn.onclick = async () => {
                        const printerName = select.value;
                        if (!printerName) {
                            alert("Seleccione una impresora para la prueba.");
                            return;
                        }
                        // Actualizar impresora por defecto en la configuración de la sesión
                        this.config.qz_default_printer = printerName;
                        try {
                            const cfg = qz.configs.create(printerName);
                            // Enviar un texto simple de prueba a la impresora seleccionada
                            const testData = [{ type: 'raw', format: 'plain', data: '*** PRUEBA DE IMPRESIÓN QZ ***\n\nGracias.\n' }];
                            await qz.print(cfg, testData);
                            alert("Impresión de prueba enviada a " + printerName);
                        } catch (err) {
                            console.error("Error al imprimir prueba QZ:", err);
                            alert("No se pudo imprimir en la impresora seleccionada.");
                        }
                    };

                    container.appendChild(select);
                    container.appendChild(btn);
                    document.body.appendChild(container);
                } catch (error) {
                    console.error("No se pudo conectar a QZ Tray:", error);
                    alert("Error de conexión con QZ Tray. Verifique que esté ejecutándose.");
                }
            }, 1000);  // pequeño retraso para asegurar que la interfaz POS esté cargada
        }
        return result;
    };

    // Definir la clase de impresora QZ Tray para impresoras de cocina u otras adicionales
    const { DeviceProxy } = require('point_of_sale.Devices');  // obtener clase base de dispositivos (según versión)
    // Nota: En Odoo 18, BasePrinter puede estar disponible vía import. Usamos DeviceProxy para simplificar envío raw.
    const QZPrinterProxy = DeviceProxy.extend({
        print_receipt: function(receipt) {
            // Enviar recibo/orden al QZ Tray. 'receipt' puede ser HTML o texto.
            const printerName = this.device.qz_printer_name || this.pos.config.qz_default_printer;
            if (!printerName) {
                return Promise.reject('No hay impresora QZ configurada.');
            }
            // Preparar contenido a imprimir (usar HTML completo si es un recibo renderizado)
            let printData;
            if (typeof receipt === 'string') {
                printData = [{ type: 'html', format: 'plain', data: receipt }];
            } else {
                // Si es objeto (ej. un pedido de cocina formateado), convertir a texto plano JSON
                printData = [{ type: 'raw', format: 'plain', data: JSON.stringify(receipt) }];
            }
            const cfg = qz.configs.create(printerName);
            return qz.print(cfg, printData);
        }
    });

    // Registrar la nueva clase de dispositivo para tipo 'qz_tray'
    const devices = require('point_of_sale.devices');
    devices.deviceProxy.Printer['qz_tray'] = QZPrinterProxy;
});
