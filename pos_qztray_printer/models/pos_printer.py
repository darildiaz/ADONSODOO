# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models, api, _
from odoo.exceptions import ValidationError

class PosPrinter(models.Model):

    _inherit = 'pos.printer'

    printer_type = fields.Selection(selection_add=[('qztray_epos', 'Use a QZTray printer')])
    qztray_printer_ip = fields.Char(string='Printer IP', help="Local IP address of printer", default="192.168.1.100")
    qztray_printer_host = fields.Char(string='Host', help="Local host address of printer", default="8182")
    qztray_printer_name = fields.Char(string='Printer Name', help="Local name of printer", default="EPSON_TM-T20II")

    @api.constrains('qztray_printer_ip')
    def _constrains_qztray_printer_ip(self):
        for record in self:
            if record.printer_type == 'qztray_epos' and not record.qztray_printer_ip:
                raise ValidationError(_("QZTray Printer IP Address cannot be empty."))

    @api.model
    def _load_pos_data_fields(self, config_id):
        params = super()._load_pos_data_fields(config_id)
        params += ['qztray_printer_ip', 'qztray_printer_host', 'qztray_printer_name']
        return params