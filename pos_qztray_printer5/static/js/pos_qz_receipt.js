// static/src/js/pos_qz_receipt.js
odoo.define('pos_qz_tray.CustomReceiptScreen', function(require) {
    'use strict';
    const ReceiptScreen = require('point_of_sale.ReceiptScreen');
    const Registries = require('point_of_sale.Registries');

    const CustomReceiptScreen = (ReceiptScreen) => {
        class CustomReceiptScreen extends ReceiptScreen {
            async printReceipt() {
                const order = this.currentOrder;
                // Verificar si QZ Tray está habilitado en la configuración POS
                if (this.env.pos.config.qz_tray_host) {
                    try {
                        // Conectar a QZ Tray si no está ya conectado
                        if (!qz.websocket.isActive()) {
                            await qz.websocket.connect({ host: this.env.pos.config.qz_tray_host });
                        }
                        // Determinar impresora objetivo: usar la predeterminada o la por defecto del sistema
                        const printerName = this.env.pos.config.qz_default_printer;
                        const targetPrinter = printerName || (await qz.printers.getDefault());
                        if (!targetPrinter) {
                            await this.showPopup('ErrorPopup', {
                                title: this.env._t('Impresora no encontrada'),
                                body: this.env._t('No hay impresoras disponibles a través de QZ Tray.')
                            });
                            return false;
                        }
                        // Crear configuración de impresora y enviar el HTML del recibo
                        const config = qz.configs.create(targetPrinter);
                        const receiptHtml = this.el.querySelector('.pos-receipt').outerHTML;
                        const data = [{ type: 'html', format: 'plain', data: receiptHtml }];
                        await qz.print(config, data);
                        order._printed = true;
                        return true;
                    } catch (error) {
                        console.error('Error imprimiendo con QZ Tray:', error);
                        await this.showPopup('ErrorPopup', {
                            title: this.env._t('Falló la impresión'),
                            body: error.message || this.env._t('No se pudo imprimir mediante QZ Tray.')
                        });
                        return false;
                    }
                } else {
                    // Si QZ Tray no está activo, usar la lógica original
                    const wasPrinted = await this._printReceipt();
                    if (wasPrinted) {
                        order._printed = true;
                    }
                    return wasPrinted;
                }
            }
        }
        CustomReceiptScreen.template = ReceiptScreen.template;
        return CustomReceiptScreen;
    };

    Registries.Component.addByExtending(CustomReceiptScreen, ReceiptScreen);
});
