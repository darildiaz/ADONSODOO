# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models, api

class PosConfig(models.Model):
    _inherit = 'pos.config'

    qztray_printer_ip = fields.Char(string='Printer IP', help="Local IP address of printer")
    qztray_printer_host = fields.Char(string='Host', help="Local host address of printer")
    qztray_printer_name = fields.Char(string='Printer Name', help="Local name of printer")
    
    @api.model
    def _get_default_qztray_values(self):
        """Obtiene valores por defecto desde la configuración global"""
        IrConfigParam = self.env['ir.config_parameter'].sudo()
        return {
            'qztray_printer_ip': IrConfigParam.get_param('pos_qztray.printer_ip', default=''),
            'qztray_printer_host': IrConfigParam.get_param('pos_qztray.printer_host', default=''),
            'qztray_printer_name': IrConfigParam.get_param('pos_qztray.printer_name', default='')
        }
        
    @api.model_create_multi
    def create(self, vals_list):
        """Establece valores predeterminados de QZTray al crear un nuevo POS"""
        defaults = self._get_default_qztray_values()
        for vals in vals_list:
            for key, value in defaults.items():
                if key not in vals and value:
                    vals[key] = value
        return super().create(vals_list)