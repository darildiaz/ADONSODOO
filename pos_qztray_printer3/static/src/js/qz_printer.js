
import { BasePrinter } from "@point_of_sale/app/printer/base_printer";
import { _t } from "@web/core/l10n/translation";

export class QZPrinter extends BasePrinter {
    setup({ serverUrl }) {
        super.setup(...arguments);
        this.serverUrl = serverUrl || "http://localhost:8182";
        this.printerName = null;  // Se seleccionará dinámicamente
    }

    async getAvailablePrinters() {
        try {
    //        await qz.websocket.connect();
            await qz.websocket.connect({ host: "localhost", port: 8182 });
            let printers = await qz.printers.find();
            return printers;
        } catch (error) {
            console.error("Error al obtener impresoras de QZ Tray:", error);
            return [];
        }
    }

    async selectPrinter() {
        let printers = await this.getAvailablePrinters();
        if (printers.length === 0) {
            alert("No hay impresoras disponibles en QZ Tray.");
            return;
        }

        // Crear el popup para selección de impresora
        let printerList = printers.map(printer => `<option value="${printer}">${printer}</option>`).join('');
        let printerSelectionHtml = `
            <div>
                <label>Selecciona una impresora:</label>
                <select id="qzPrinterSelect">${printerList}</select>
                <button id="confirmPrinterBtn">Confirmar</button>
            </div>
        `;

        // Agregar al DOM
        let modal = document.createElement("div");
        modal.innerHTML = printerSelectionHtml;
        modal.style.position = "fixed";
        modal.style.top = "50%";
        modal.style.left = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.padding = "20px";
        modal.style.background = "white";
        modal.style.border = "1px solid black";
        modal.style.zIndex = "1000";
        document.body.appendChild(modal);

        // Manejar la selección de impresora
        document.getElementById("confirmPrinterBtn").addEventListener("click", () => {
            this.printerName = document.getElementById("qzPrinterSelect").value;
            alert("Impresora seleccionada: " + this.printerName);
            document.body.removeChild(modal);
        });
    }

    async printReceipt(receiptData) {
        if (!this.printerName) {
            await this.selectPrinter();
            if (!this.printerName) {
                console.error("No se seleccionó una impresora.");
                return;
            }
        }

        try {
            // Generar PDF con jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFontSize(16);
            doc.text("Ticket de Compra", 20, 20);
            doc.setFontSize(12);
            doc.text(receiptData, 20, 40);
            let pdfBase64 = doc.output('datauristring').split(',')[1];

            // Configurar impresora en QZ Tray
            let config = qz.configs.create(this.printerName);
            let data = [{ type: 'pixel', format: 'pdf', flavor: 'base64', data: pdfBase64 }];

            // Enviar impresión
            await qz.print(config, data);
            console.log("Impresión enviada a " + this.printerName);
        } catch (error) {
            console.error("Error al imprimir con QZ Tray:", error);
        }
    }
}
