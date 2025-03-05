# -*- coding: utf-8 -*-
from odoo import fields, models, api, _
from odoo.exceptions import ValidationError

class PosPrinter(models.Model):
    _inherit = 'pos.printer'

    printer_type = fields.Selection(selection_add=[('qztray', 'Use QZ Tray printer')])
    qztray_printer_name = fields.Char(string='QZ Tray Printer Name', 
                                      help="Name of the printer as registered in QZ Tray")
    product_categories_ids = fields.Many2many('pos.category', string='Product Categories',
                                            help="Categories of products that will print to this printer")
    printer_options = fields.Text(string='Printer Options', 
                                 help="JSON configuration options for the printer (e.g., paper size, formatting)")

    @api.constrains('qztray_printer_name')
    def _constrains_qztray_printer_name(self):
        for record in self:
            if record.printer_type == 'qztray' and not record.qztray_printer_name:
                raise ValidationError(_("QZ Tray Printer Name cannot be empty."))

    @api.model
    def _load_pos_data_fields(self, config_id):
        params = super()._load_pos_data_fields(config_id)
        params += ['qztray_printer_name', 'product_categories_ids', 'printer_options']
        return params