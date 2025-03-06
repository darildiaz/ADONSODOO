import { BasePrinter } from "@point_of_sale/app/printer/base_printer";
import { _t } from "@web/core/l10n/translation";

// Nota: No es necesario usar getTemplate ya que QZ Tray trabaja de forma diferente

export class QZTrayPrinter extends BasePrinter {
    /**
     * Configuración inicial utilizando los campos definidos en el modelo de Odoo.
     * Se espera recibir al menos "qztray_printer_name" para identificar la impresora.
     */
    setup({ qztray_printer_ip, qztray_printer_host, qztray_printer_name }) {
        super.setup(...arguments);
        this.printerName = qztray_printer_name || "default_printer";
        this.printerIP = qztray_printer_ip;
        this.printerHost = qztray_printer_host;
        // Se intenta conectar a QZ Tray, normalmente en localhost:8181.
        if (typeof qz !== "undefined") {
            qz.websocket.connect().catch(err => {
                console.error("Error al conectar con QZ Tray:", err);
            });
        } else {
            console.error("La librería QZ Tray no está cargada");
        }
    }

    /**
     * Convierte el canvas en una imagen rasterizada, la codifica en base64 y la envía como parte del trabajo de impresión.
     * Aquí se prepara un trabajo "raw" para QZ Tray.
     */
    processCanvas(canvas) {
        const rasterData = this.canvasToRaster(canvas);
        const encodedData = this.encodeRaster(rasterData);
        // Se crea un trabajo de impresión que envía la imagen codificada y posteriormente un comando de corte.
        const printJob = [
            { type: "raw", format: "base64", data: encodedData },
            // Comando ESC/POS para corte total (puede variar según el modelo de impresora)
            { type: "raw", data: "\x1D\x56\x00" }
        ];
        return printJob;
    }

    /**
     * Envía el trabajo de impresión utilizando QZ Tray.
     */
    async sendPrintingJob(job) {
        if (typeof qz === "undefined") {
            console.error("La librería QZ Tray no está cargada");
            return { result: false, printerErrorCode: "QZTrayNotLoaded" };
        }
        const config = qz.configs.create(this.printerName);
        try {
            await qz.print(config, job);
            return { result: true, printerErrorCode: null };
        } catch (error) {
            console.error("Error de impresión en QZ Tray:", error);
            return { result: false, printerErrorCode: error.message };
        }
    }

    /**
     * Envía un comando para abrir la caja registradora.
     * Se usa un comando raw (ESC/POS) para activar el cajón, el cual puede variar según el hardware.
     */
    openCashbox() {
        const cashboxCommand = "\x1B\x70\x00\x19\xFA";
        this.sendPrintingJob([{ type: "raw", data: cashboxCommand }]);
    }

    /**
     * Transforma el canvas en una imagen rasterizada monocromática utilizando dithering de Floyd-Steinberg.
     */
    canvasToRaster(canvas) {
        const imageData = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const errors = Array.from(Array(width), () => Array(height).fill(0));
        const rasterData = new Array(width * height).fill(0);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                let oldColor = pixels[idx] * 0.299 + pixels[idx + 1] * 0.587 + pixels[idx + 2] * 0.114;
                oldColor += errors[x][y];
                oldColor = Math.min(255, Math.max(0, oldColor));
                let newColor;
                if (oldColor < 128) {
                    newColor = 0;
                    rasterData[y * width + x] = 1;
                } else {
                    newColor = 255;
                    rasterData[y * width + x] = 0;
                }
                const error = oldColor - newColor;
                if (error) {
                    if (x < width - 1) {
                        errors[x + 1][y] += (7 / 16) * error;
                    }
                    if (x > 0 && y < height - 1) {
                        errors[x - 1][y + 1] += (3 / 16) * error;
                    }
                    if (y < height - 1) {
                        errors[x][y + 1] += (5 / 16) * error;
                    }
                    if (x < width - 1 && y < height - 1) {
                        errors[x + 1][y + 1] += (1 / 16) * error;
                    }
                }
            }
        }
        return rasterData.join("");
    }

    /**
     * Codifica la imagen rasterizada en base64.
     */
    encodeRaster(rasterData) {
        let encodedData = "";
        for (let i = 0; i < rasterData.length; i += 8) {
            const sub = rasterData.substr(i, 8);
            encodedData += String.fromCharCode(parseInt(sub, 2));
        }
        return btoa(encodedData);
    }

    /**
     * Personaliza el mensaje de error en caso de fallo en la impresión.
     */
    getActionError() {
        const printRes = this.getResultsError({ printerErrorCode: "Unknown" });
        if (window.location.protocol === "https:") {
            printRes.message.body += _t(
                "Si estás en un servidor seguro (HTTPS), asegúrate de haber aceptado manualmente el certificado para QZ Tray."
            );
        }
        return printRes;
    }

    /**
     * Define los mensajes de error basados en el código devuelto.
     */
    getResultsError(printResult) {
        const errorCode = printResult.printerErrorCode;
        let message =
            _t("La impresora se alcanzó exitosamente, pero no pudo imprimir.") + "\n";
        if (errorCode) {
            message += "\n" + _t("El siguiente código de error fue devuelto:") + "\n" + errorCode;
            const extra_messages = {
                DeviceNotFound:
                    _t("Revisa la configuración de la impresora y asegúrate de que el 'Printer Name' esté correctamente establecido."),
            };
            if (errorCode in extra_messages) {
                message += "\n" + extra_messages[errorCode];
            }
            message += "\n" + _t("Para obtener más detalles, busca en línea:") + "\n" + "QZ Tray Print " + errorCode;
        } else {
            message += _t("Verifica que la impresora tenga papel y esté lista para imprimir.");
        }
        return {
            successful: false,
            errorCode: errorCode,
            message: {
                title: _t("Fallo en la impresión"),
                body: message,
            },
        };
    }
}
