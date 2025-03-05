# models/pos_printer.py
from odoo import fields, models, api, _
from odoo.exceptions import ValidationError

class PosPrinter(models.Model):
    _inherit = 'pos.printer'

    printer_type = fields.Selection(
        selection_add=[('qz_tray', 'Use QZ Tray')],
        ondelete={'qz_tray': 'set default'}
    )
    qz_printer_name = fields.Char(
        string="Nombre Impresora QZ",
        help="Nombre de la impresora configurada en QZ Tray."
    )

    @api.constrains('qz_printer_name')
    def _check_qz_printer_name(self):
        for printer in self:
            if printer.printer_type == 'qz_tray' and not printer.qz_printer_name:
                raise ValidationError(_("Debe especificar el nombre de la impresora QZ Tray."))

    @api.model
    def _load_pos_data_fields(self, config_id):
        # Incluir el campo qz_printer_name al enviar datos al POS frontend
        params = super(PosPrinter, self)._load_pos_data_fields(config_id)
        params += ['qz_printer_name']
        return params
