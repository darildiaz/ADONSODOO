from odoo import models, fields, api

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    # Campo para el nombre de la impresora de QZ Tray
    qz_printer_name = fields.Char('QZ Tray Printer Name', related='pos_config_id.default_qz_printer', readonly=False)
    
    # Campo para configurar la IP de QZ Tray
    qz_printer_ip = fields.Char('QZ Tray IP', related='pos_config_id.qz_printer_ip', readonly=False)
    
    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        config = self.env['pos.config'].search([('id', '=', 1)])  # Configuración global
        res.update(
            default_qz_printer=config.default_qz_printer,
            qz_printer_ip=config.qz_printer_ip
        )
        return res

    def set_values(self):
        super(ResConfigSettings, self).set_values()
        # Guardamos las configuraciones de impresoras de QZ Tray
        self.env['pos.config'].search([('id', '=', 1)]).write({
            'default_qz_printer': self.qz_printer_name,
            'qz_printer_ip': self.qz_printer_ip
        })
