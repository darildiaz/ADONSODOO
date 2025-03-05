# -*- coding: utf-8 -*-
from odoo import fields, models, api

class PosConfig(models.Model):
    _inherit = 'pos.config'

    use_qztray = fields.Boolean(string='Use QZ Tray', default=False,
                               help="Use QZ Tray for receipt printing instead of IoT Box")
    qztray_server_url = fields.Char(string='QZ Tray Server URL', 
                                    default="http://localhost:8182",
                                    help="URL of the QZ Tray server (default: http://localhost:8182)")
    qztray_auth_token = fields.Char(string='QZ Tray Auth Token', 
                                   help="Authentication token for QZ Tray (if required)")
    qztray_certificate = fields.Text(string='QZ Tray Certificate', 
                                    help="Certificate for secure communication with QZ Tray")