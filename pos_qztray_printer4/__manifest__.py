{
    'name': 'POS QZ Tray Printer',
    'version': '1.0',
    'depends': ['point_of_sale'],
    'data': [
        'assets.xml',  # Carga assets.xml para incluir los scripts
        'views/pos_printer_views.xml',
        'views/pos_config_views.xml',
        'views/res_config_settings_views.xml',
    ],
    'installable': True,
    'application': False,
}
