# -*- coding: utf-8 -*-
{
    'name': "POS QZ Tray Printer",
    'summary': """
        Integración de QZ Tray con Odoo POS para impresión de tickets en restaurantes
    """,
    
    'description': """
        Este módulo reemplaza el sistema de impresión IoT Box del Punto de Venta (POS) con QZ Tray 
        para la impresión de tickets en restaurantes, permitiendo gestionar un servidor de impresoras centralizado.

        Características principales:
        - Conexión con QZ Tray instalado en un servidor central de impresoras
        - Asociación de categorías de productos con impresoras específicas
        - Impresión automática de órdenes en la impresora correspondiente según la categoría del producto
    """,
    'author': "Ing . daril diaz",
    'website': "https://www.yourcompany.com",
    'category': 'Point of Sale',
    'version': '1.0',
    'depends': ['point_of_sale'],
    'data': [
        'views/pos_config_views.xml',
        'views/pos_printer_views.xml',
        'views/res_config_settings_views.xml',
        'data/qztray_data.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            'pos_qztray_printer/static/src/app/qztray_printer.js',
            'pos_qztray_printer/static/src/app/pos_store.js',
        ],
    },
    'installable': True,
    'auto_install': False,
    'application': False,
    'license': 'LGPL-3',
}