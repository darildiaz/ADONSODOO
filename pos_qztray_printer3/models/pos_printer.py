from odoo import fields, models, api
from odoo.exceptions import ValidationError

class PosPrinter(models.Model):
    _inherit = 'pos.printer'

    printer_type = fields.Selection(selection_add=[('qz_tray', 'Use QZ Tray Printer')])
    qz_printer_name = fields.Char(string='QZ Tray Printer Name', help="Nombre de la impresora configurada en QZ Tray." )


    @api.constrains('qz_printer_name')
    def _check_qz_printer_name(self):
        for record in self:
            if record.printer_type == 'qz_tray' and not record.qz_printer_name:
                raise ValidationError(_("Debe especificar un nombre de impresora para QZ Tray."))
                @api.model
                def get_available_printers(self):
                    # This method should interact with QZ Tray to get the list of available printers
                    # For demonstration purposes, we'll return a static list
                    return [
                        {'name': 'Printer1', 'status': 'online'},
                        {'name': 'Printer2', 'status': 'offline'},
                        {'name': 'Printer3', 'status': 'online'},
                    ]