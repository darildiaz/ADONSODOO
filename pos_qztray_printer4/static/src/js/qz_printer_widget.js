import { registry } from "@web/core/registry";
import { FieldSelection } from "@web/views/fields/field_selection"; // base Odoo selection

// Configuración global para la IP y el puerto de QZ Tray
const QZ_CONFIG = {
    host: "localhost",  // Definir la IP aquí
    port: 8182,         // Puerto de QZ Tray
};

export class QzPrinterSelection extends FieldSelection {
    setup() {
        super.setup();
        this.loadPrinters();
    }

    // Conectar con QZ Tray y obtener impresoras
    async loadPrinters() {
        try {
            await qz.websocket.connect({ host: QZ_CONFIG.host, port: QZ_CONFIG.port });

            // Obtener impresoras disponibles
            let printers = await qz.printers.find();

            // Crear la lista de opciones para el dropdown
            const selectionArray = printers.map(pr => [pr, pr]);

            // Actualizar el widget con las impresoras disponibles
            this.selection = selectionArray;
            this.render();
        } catch (error) {
            console.error("Error con QZ Tray:", error);
        }
    }
}

// Registrar el widget personalizado
registry.category("fields").add("qz_printer_selection", QzPrinterSelection);
