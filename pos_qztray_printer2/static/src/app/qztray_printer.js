import { BasePrinter } from "@point_of_sale/app/printer/base_printer";
import { _t } from "@web/core/l10n/translation";
import { getTemplate } from "@web/core/templates";
import { createElement, append, createTextNode } from "@web/core/utils/xml";

/**
 * Sends print request to QZ Tray that manages multiple printers in the restaurant
 */
export class QZTrayPrinter extends BasePrinter {
    setup({ serverUrl, printerName, authToken, certificate, printerOptions }) {
        super.setup(...arguments);
        this.serverUrl = serverUrl || "http://localhost:8181";
        this.printerName = printerName;
        this.authToken = authToken;
        this.certificate = certificate;
        this.printerOptions = printerOptions ? JSON.parse(printerOptions) : {};
        this.connected = false;
        this.qz = null;
        
        // Load QZ Tray library dynamically
        this.loadQZTray();
    }
    
    /**
     * Load QZ Tray JavaScript library
     */
    async loadQZTray() {
        // Check if QZ library is already loaded
        if (window.qz) {
            this.qz = window.qz;
            await this.connectToQZ();
            return;
        }
        
        // Otherwise load it dynamically
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://cdn.jsdelivr.net/npm/qz-tray@2.2.1/qz-tray.min.js';
            script.async = true;
            script.onload = async () => {
                this.qz = window.qz;
                await this.connectToQZ();
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load QZ Tray library');
                reject(new Error('Failed to load QZ Tray library'));
            };
            document.head.appendChild(script);
        });
    }
    
    /**
     * Connect to QZ Tray service
     */
    async connectToQZ() {
        if (!this.qz) {
            return false;
        }
        
        try {
            // Set authentication if provided
            if (this.certificate) {
                this.qz.security.setCertificateData(this.certificate);
            }
            
            if (this.authToken) {
                this.qz.security.setSignaturePromise((toSign) => {
                    return this.authToken;
                });
            }
            
            // Connect to QZ Tray
            await this.qz.websocket.connect({ host: this.serverUrl });
            this.connected = true;
            return true;
        } catch (error) {
            console.error('Failed to connect to QZ Tray', error);
            this.connected = false;
            return false;
        }
    }

    /**
     * @override
     * Process receipt canvas into printable data
     */
    async processCanvas(canvas) {
        // Try to ensure we're connected to QZ Tray
        if (!this.connected) {
            await this.connectToQZ();
        }
        
        // Convert canvas to base64 image data
        const imageData = canvas.toDataURL('image/png');
        
        // Create print configuration
        const config = this.qz.configs.create(this.printerName, this.printerOptions);
        
        // Create print data
        const data = [
            { type: 'image', format: 'base64', data: imageData.split(',')[1] },
            { type: 'raw', format: 'command', data: '\x1D\x56\x41\x10' } // Paper cut command (may vary by printer)
        ];
        
        // Send print job
        return this.sendPrintingJob(config, data);
    }

    /**
     * @override
     */
    async openCashbox() {
        if (!this.connected) {
            await this.connectToQZ();
        }
        
        // Create config for the printer
        const config = this.qz.configs.create(this.printerName);
        
        // Cash drawer opening command (may vary by printer model)
        const data = [
            { type: 'raw', format: 'command', data: '\x1B\x70\x00\x19\x19' } // ESC p 0 25 25
        ];
        
        // Send command to open cash drawer
        return this.sendPrintingJob(config, data);
    }

    /**
     * @override
     */
    async sendPrintingJob(config, data) {
        try {
            await this.qz.print(config, data);
            return {
                result: true,
                printerErrorCode: null
            };
        } catch (error) {
            console.error('QZ Tray printing error:', error);
            return {
                result: false,
                printerErrorCode: error.message || 'Unknown error'
            };
        }
    }
    
    /**
     * Find the appropriate printer for a product based on its category
     * @param {Object} product - The product to be printed
     * @param {Array} printers - Available printers configuration
     * @returns {Object|null} The matching printer or null if not found
     */
    findPrinterForProduct(product, printers) {
        if (!product || !product.pos_categ_id || !printers || !printers.length) {
            return null;
        }
        
        // Find a printer that handles this product category
        return printers.find(printer => 
            printer.product_categories_ids.includes(product.pos_categ_id[0])
        );
    }

    /**
     * @override
     */
    getActionError() {
        return {
            successful: false,
            message: {
                title: _t("Connection to QZ Tray Failed"),
                body: _t("Could not connect to QZ Tray. Please make sure QZ Tray is running on the server and properly configured."),
            },
        };
    }

    /**
     * @override
     */
    getResultsError(printResult) {
        const errorCode = printResult.printerErrorCode;
        
        return {
            successful: false,
            errorCode: errorCode,
            message: {
                title: _t("Printing Failed"),
                body: _t("Failed to print to QZ Tray printer. Error: ") + errorCode,
            },
        };
    }
    
    /**
     * Disconnect from QZ Tray when no longer needed
     */
    async disconnect() {
        if (this.qz && this.connected) {
            try {
                await this.qz.websocket.disconnect();
                this.connected = false;
            } catch (error) {
                console.error('Error disconnecting from QZ Tray:', error);
            }
        }
    }
}