function printTest() {
    let selectedPrinter = document.getElementById("printerSelect").value;
    
    if (!selectedPrinter) {
        alert("Selecciona una impresora primero.");
        return;
    }

    let config = qz.configs.create(selectedPrinter); // Configurar la impresora
    let data = ["^XA", "^FO50,50^ADN,36,20^FDImpresión de prueba^FS", "^XZ"]; // Comando ZPL para impresoras térmicas

    qz.print(config, data).then(() => {
        console.log("Impresión enviada a " + selectedPrinter);
    }).catch(err => console.error("Error al imprimir:", err));
}


qz.websocket.connect({ host: 'localhost', port: 8182 }).then(() => {
    console.log("Conectado a QZ Tray en el puerto 8182");
});
