# __manifest__.py
{
    'name': 'POS QZ Tray Printer Integration',
    'summary': 'Imprimir tickets POS y órdenes de cocina a través de QZ Tray',
    'version': '1.0',
    'category': 'Point of Sale',
    'author': 'YourCompany',
    'license': 'LGPL-3',
    'depends': ['point_of_sale', 'pos_restaurant'],
    'data': [
        'views/pos_config_views.xml',
        'views/pos_printer_views.xml',
    ],
    'assets': {
        'point_of_sale.assets': [
            # Biblioteca QZ Tray (debe añadirse en static/lib)
            'pos_qz_tray_module/static/lib/qz-tray.js',
            # Archivos JavaScript de integración
            'pos_qz_tray_module/static/src/js/pos_qz_tray.js',
            'pos_qz_tray_module/static/src/js/pos_qz_receipt.js',
        ],
        'web.assets_qweb': [
            # (No incluye plantillas QWeb adicionales)
        ],
    },
}
