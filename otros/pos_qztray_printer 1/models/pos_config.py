# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models

class PosConfig(models.Model):
    _inherit = 'pos.config'

    qztray_printer_ip = fields.Char(string=' Printer IP', help="Local IP address printer")
    qztray_printer_host = fields.Char(string='host', help="Local host address printer")
    qztray_printer_name = fields.Char(string='name printerr', help="Local name printer")
