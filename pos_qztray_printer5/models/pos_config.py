# models/pos_config.py
from odoo import fields, models

class PosConfig(models.Model):
    _inherit = 'pos.config'

    qz_tray_host = fields.Char(
        string="QZ Tray Host/IP", 
        default="localhost",
        help="Dirección del host donde se ejecuta QZ Tray (e.g., 'localhost' o una IP)."
    )
    qz_default_printer = fields.Char(
        string="Impresora QZ por Defecto",
        help="Nombre de la impresora predeterminada en QZ Tray para esta sesión POS."
    )
