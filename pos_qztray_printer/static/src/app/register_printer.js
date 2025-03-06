import { printerRegistry } from "@point_of_sale/app/printer/printer_service";
import { QZTrayPrinter } from "./qztray_printer";

// Registra el nuevo tipo de impresora QZTray
printerRegistry.add('qztray_epos', QZTrayPrinter);