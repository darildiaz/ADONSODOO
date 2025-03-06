# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models, api


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    pos_qztray_printer_ip = fields.Char(compute='_compute_pos_qztray_printer_ip', store=True, readonly=False)

    pos_qztray_printer_host = fields.Char(compute='_compute_pos_qztray_printer_host', store=True, readonly=False)
    pos_qztray_printer_name = fields.Char(compute='_compute_pos_qztray_printer_name', store=True, readonly=False)

    @api.depends('pos_qztray_printer_ip')
    def _compute_pos_qztray_printer_ip(self):
        """Obtiene el valor almacenado en ir.config_parameter para la IP de la impresora"""
        for record in self:
            record.pos_qztray_printer_ip = self.env['ir.config_parameter'].sudo().get_param('pos_qztray_printer_ip', default='')

    @api.depends('pos_qztray_printer_host')
    def _compute_pos_qztray_printer_host(self):
        """Obtiene el valor almacenado en ir.config_parameter para el Host de la impresora"""
        for record in self:
            record.pos_qztray_printer_host = self.env['ir.config_parameter'].sudo().get_param('pos_qztray_printer_host', default='')

    @api.depends('pos_qztray_printer_name')
    def _compute_pos_qztray_printer_name(self):
        """Obtiene el valor almacenado en ir.config_parameter para el Nombre de la impresora"""
        for record in self:
            record.pos_qztray_printer_name = self.env['ir.config_parameter'].sudo().get_param('pos_qztray_printer_name', default='')

    def set_values(self):
        """Guarda los valores en ir.config_parameter cuando el usuario edita los campos"""
        super(ResConfigSettings, self).set_values()
        self.env['ir.config_parameter'].sudo().set_param('pos_qztray_printer_ip', self.pos_qztray_printer_ip or '')
        self.env['ir.config_parameter'].sudo().set_param('pos_qztray_printer_host', self.pos_qztray_printer_host or '')
        self.env['ir.config_parameter'].sudo().set_param('pos_qztray_printer_name', self.pos_qztray_printer_name or '')