from odoo import fields, models, api

class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    qz_server_url = fields.Char(string="QZ Tray Server URL", default="http://localhost:8182", help="Dirección del servidor de QZ Tray")
    qz_default_printer = fields.Char(string="QZ Tray Default Printer", help="Nombre de la impresora en QZ Tray")

    @api.model
    def get_values(self):
        res = super(ResConfigSettings, self).get_values()
        res.update({
            'qz_server_url': self.env['ir.config_parameter'].sudo().get_param('pos_qz_tray.qz_server_url', default="http://localhost:8182"),
            'qz_default_printer': self.env['ir.config_parameter'].sudo().get_param('pos_qz_tray.qz_default_printer', default=""),
        })
        return res

    def set_values(self):
        super(ResConfigSettings, self).set_values()
        self.env['ir.config_parameter'].sudo().set_param('pos_qz_tray.qz_server_url', self.qz_server_url)
        self.env['ir.config_parameter'].sudo().set_param('pos_qz_tray.qz_default_printer', self.qz_default_printer)
