# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.


from odoo import models, fields  # ✅ Agregamos la importación de models y fields

class PosConfig(models.Model):
    _inherit = 'pos.config'

    qz_server_url = fields.Char(string='QZ Tray Server URL', default="http://localhost:8182",
                                help="URL del servidor QZ Tray para impresión de tickets.")
