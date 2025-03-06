document.addEventListener('DOMContentLoaded', function() {
    // Configuración de conexión con QZ Tray en el puerto 8182
    qz.websocket.connect({ host: 'localhost', port: 8182 }).then(function() {
      // Obtener todas las impresoras disponibles
      return qz.printers.find();  // Esto devuelve todas las impresoras conectadas
    }).then(function(printers) {
      // Poblar el select de impresoras
      var printerSelect = document.getElementById('printerList');
      printers.forEach(function(printer) {
        var option = document.createElement('option');
        option.value = printer;
        option.textContent = printer;
        printerSelect.appendChild(option);
      });
    }).catch(function(err) {
      console.error('Error al conectar con QZ Tray:', err);
      alert('No se pudo conectar con QZ Tray. Asegúrate de que está instalado y ejecutándose en localhost:8182.');
    });
  
    // Agregar producto/monto a la tabla
    document.getElementById('addItemBtn').addEventListener('click', function() {
      var product = document.getElementById('productName').value.trim();
      var price = document.getElementById('productPrice').value.trim();
      if (product && price) {
        // Crear nueva fila en la tabla de items
        var tbody = document.getElementById('itemTableBody');
        var row = document.createElement('tr');
        var prodCell = document.createElement('td');
        var priceCell = document.createElement('td');
        prodCell.textContent = product;
        priceCell.textContent = price;
        row.appendChild(prodCell);
        row.appendChild(priceCell);
        tbody.appendChild(row);
        // Limpiar campos de entrada
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
      }
    });
  
    // Generar PDF del ticket e imprimirlo con QZ Tray
    document.getElementById('printBtn').addEventListener('click', function() {
      var printerName = document.getElementById('printerList').value;
      if (!printerName) {
        alert('Seleccione una impresora antes de imprimir.');
        return;
      }
      // Obtener texto de encabezado (o valor por defecto)
      var headerText = document.getElementById('ticketHeader').value || 'Ticket';
      // Recopilar items de la tabla
      var items = [];
      var rows = document.querySelectorAll('#itemTableBody tr');
      rows.forEach(function(row) {
        var cols = row.querySelectorAll('td');
        if (cols.length >= 2) {
          items.push({ product: cols[0].textContent, price: cols[1].textContent });
        }
      });
  
      // Usar jsPDF para generar el contenido del PDF en base64
      var doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(headerText, 20, 20);  // Encabezado personalizado
      doc.setFontSize(12);
      var y = 40;
      items.forEach(function(item) {
        doc.text(item.product + " - $" + item.price, 20, y);
        y += 10;
      });
      // Obtener el PDF como string base64
      var pdfBase64 = doc.output('datauristring');  // Obtiene un URI base64
      var base64Content = pdfBase64.split(',')[1];  // Remover el prefijo "data:application/pdf;base64,"
  
      // Configurar la impresora seleccionada y datos para QZ Tray
      var config = qz.configs.create(printerName);
      var data = [{
        type: 'pixel',
        format: 'pdf',
        flavor: 'base64',
        data: base64Content  // contenido PDF en base64
      }];
  
      // Enviar a imprimir mediante QZ Tray
      qz.print(config, data).then(function() {
        console.log('Impresión enviada correctamente');
      }).catch(function(e) {
        console.error('Error al imprimir:', e);
        alert('Error al imprimir el ticket:\n' + e);
      });
    });
  });
  