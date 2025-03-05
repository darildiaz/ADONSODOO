import { registry } from "@web/core/registry";
import { FieldSelection } from "@web/views/fields/field_selection"; // base Odoo selection

export class QzPrinterSelection extends FieldSelection {
    setup() {
        super.setup();
        this.loadPrinters();
    }

    async loadPrinters() {
        try {
            // Conectar a QZ Tray
            await qz.websocket.connect({ host: "localhost", port: 8182 });

            // Obtener impresoras disponibles
            let printers = await qz.printers.find();

            // Crear la lista de opciones
            const selectionArray = printers.map(pr => [pr, pr]);

            // Actualizar el widget con las opciones obtenidas
            this.selection = selectionArray;
            this.render();
        } catch (error) {
            console.error("Error con QZ Tray:", error);
        }
    }
}

registry.category("fields").add("qz_printer_selection", QzPrinterSelection);
