{
    'name': 'POS QZ Tray Printer',
    'version': '1.0',
    'category': 'Sales/Point of Sale',
    'summary': 'Print POS receipts using QZ Tray',
    'author': 'Ing. Daril Diaz',
    'depends': ['point_of_sale'],
    'data': [
"assets.xml",  # <-- cargamos el archivo con ir.asset
        'views/pos_config_views.xml',
        'views/pos_printer_views.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_qztray_printer/static/src/js/qz_printer.js',
        ],
        "web.assets_backend": [
            "pos_qztray_printer/static/js/qz_printer_widget.js",
   ],
    },
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}


