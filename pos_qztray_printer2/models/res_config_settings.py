# -*- coding: utf-8 -*-
from odoo import fields, models, api

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    pos_use_qztray = fields.Boolean(related='pos_config_id.use_qztray', readonly=False)
    pos_qztray_server_url = fields.Char(related='pos_config_id.qztray_server_url', readonly=False)
    pos_qztray_auth_token = fields.Char(related='pos_config_id.qztray_auth_token', readonly=False)
    pos_qztray_certificate = fields.Text(related='pos_config_id.qztray_certificate', readonly=False)

    @api.onchange('pos_use_qztray')
    def _onchange_pos_use_qztray(self):
        if self.pos_use_qztray and self.pos_iface_print_via_proxy:
            self.pos_iface_print_via_proxy = False