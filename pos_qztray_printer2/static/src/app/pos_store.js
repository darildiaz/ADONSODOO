import { PosStore } from "@point_of_sale/app/store/pos_store";
import { QZTrayPrinter } from "@pos_qztray_printer/app/qztray_printer";
import { patch } from "@web/core/utils/patch";

patch(PosStore.prototype, {
    afterProcessServerData() {
        var self = this;
        return super.afterProcessServerData(...arguments).then(function () {
            if (self.config.use_qztray) {
                // Create and set up QZ Tray printer
                self.hardwareProxy.printer = new QZTrayPrinter({ 
                    serverUrl: self.config.qztray_server_url,
                    printerName: '', // Empty as we'll choose printer based on product category
                    authToken: self.config.qztray_auth_token,
                    certificate: self.config.qztray_certificate
                });
                
                // Store printers by category for later use
                self.qzCategoryPrinters = {};
                
                // Load all configured printers
                self.loadQZPrinters();
            }
        });
    },
    
    loadQZPrinters() {
        const self = this;
        // Get all printers configured for QZ Tray
        const qzPrinters = this.printers.filter(p => p.printer_type === 'qztray');
        
        // Set up category to printer mapping
        qzPrinters.forEach(printer => {
            if (printer.product_categories_ids && printer.product_categories_ids.length) {
                printer.product_categories_ids.forEach(categoryId => {
                    self.qzCategoryPrinters[categoryId] = printer;
                });
            }
        });
    },
    
    create_printer(config) {
        if (config.printer_type === "qztray") {
            return new QZTrayPrinter({ 
                serverUrl: this.config.qztray_server_url,
                printerName: config.qztray_printer_name,
                authToken: this.config.qztray_auth_token,
                certificate: this.config.qztray_certificate,
                printerOptions: config.printer_options
            });
        } else {
            return super.create_printer(...arguments);
        }
    },
    
    // Patch the order's printChanges method to handle printing to multiple printers
    // based on product categories
    send_order_to_kitchen(order) {
        if (this.config.use_qztray) {
            // Group orderlines by printer based on product category
            const orderlinesByPrinter = {};
            
            // Iterate through orderlines and group them by printer
            for (const line of order.get_orderlines()) {
                const product = line.get_product();
                
                if (product && product.pos_categ_id) {
                    const categoryId = product.pos_categ_id[0];
                    const printer = this.qzCategoryPrinters[categoryId];
                    
                    if (printer) {
                        if (!orderlinesByPrinter[printer.id]) {
                            orderlinesByPrinter[printer.id] = [];
                        }
                        orderlinesByPrinter[printer.id].push(line);
                    }
                }
            }
            
            // Print to each printer with its respective orderlines
            for (const printerId in orderlinesByPrinter) {
                const printer = this.printers.find(p => p.id === parseInt(printerId));
                const orderlines = orderlinesByPrinter[printerId];
                
                if (printer && orderlines.length > 0) {
                    // Create a temporary order with only the relevant orderlines
                    const tempOrder = {...order};
                    tempOrder.get_orderlines = () => orderlines;
                    
                    // Get the printer instance
                    const printerInstance = this.create_printer(printer);
                    
                    // Generate receipt and print
                    const receipt = this.generate_kitchen_receipt_html(tempOrder);
                    printerInstance.print_receipt(receipt);
                }
            }
            
            return true;
        }
        
        // Fall back to original behavior if QZ Tray is not enabled
        return super.send_order_to_kitchen(order);
    }
});

// Patch the original OrderWidget to hook into the "Order" button click
import { OrderWidget } from "@point_of_sale/app/screens/order/order_widget";

patch(OrderWidget.prototype, {
    async sendOrderToKitchen() {
        const result = await super.sendOrderToKitchen(...arguments);
        
        // If QZ Tray is enabled, this will have been handled in the patched send_order_to_kitchen method
        return result;
    }
});