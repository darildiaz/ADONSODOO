from odoo import models, fields, api

class PosPrinter(models.Model):
    _name = 'pos.printer'
    _description = 'POS Printer Configuration'

    name = fields.Char('Printer Name')
    printer_type = fields.Selection([
        ('qz_tray', 'QZ Tray'),
        ('epson', 'Epson'),
        ('iot', 'IoT Printer')
    ], string='Printer Type', default='qz_tray')
    
    # Este campo será usado para almacenar el nombre de la impresora de QZ Tray seleccionada
    qz_printer_name = fields.Char('QZ Tray Printer Name')
    
    # El campo IP solo será utilizado si el tipo de impresora es QZ Tray
    qz_printer_ip = fields.Char('QZ Tray IP', default='localhost')  # Por defecto localhost, se puede
