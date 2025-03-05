from odoo import models, fields, api

class PosConfig(models.Model):
    _inherit = 'pos.config'

    # Aquí definimos el campo de impresora por defecto (que podría ser de tipo QZ Tray)
    default_qz_printer = fields.Char(string='Default QZ Printer')
    
    # Este método se puede utilizar para obtener la impresora configurada por defecto
    @api.model
    def get_default_printer(self):
        config = self.search([('id', '=', 1)])  # Se puede buscar según lo que necesites
        if config:
            return config.default_qz_printer
        return None
