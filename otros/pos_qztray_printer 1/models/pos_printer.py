# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models, api, _
from odoo.exceptions import ValidationError

class PosPrinter(models.Model):

    _inherit = 'pos.printer'

    printer_type = fields.Selection(selection_add=[('qztray_epos', 'Use an Qztray printer')])
    qztray_printer_ip = fields.Char(string=' Printer IP', help="Local IP address printer",default="192.168.1.100")
    qztray_printer_host = fields.Char(string=' host', help="Local host address printer",default="8182")
    qztray_printer_name = fields.Char(string='name printerr', help="Local name printer",default="EPSON_TM-T20II")

    @api.constrains('qztray_printer_ip')
    def _constrains_epson_printer_ip(self):
        for record in self:
            if record.printer_type == 'qztray_epos' and not record.qztray_printer_ip:
                raise ValidationError(_("qztray Printer IP Address cannot be empty."))

    @api.model
    def _load_pos_data_fields(self, config_id):
        params = super()._load_pos_data_fields(config_id)
        params += ['qztray_printer_ip']
        return params
