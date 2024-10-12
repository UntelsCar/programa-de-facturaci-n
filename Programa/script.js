const FORM = document.getElementById("formId");
const INPUT = document.getElementById("inputId");
const TABLE = document.getElementById("tableId");
const BTN = document.getElementById("btnGozu");

FORM.addEventListener("submit", function () {
    if (INPUT.files[0] == null) return null;
    let reader = new FileReader();
    reader.readAsText(INPUT.files[0]);
    reader.onload = function(element) {
        let xmlFile = $.parseXML(element.target.result);
        let currentDate = new Date();
        currentDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;

        let cbcId = xmlFile.getElementsByTagName("cbc:ID")[0]?.childNodes[0]?.nodeValue || "null";
        let [Serie_comp, Número_comp] = cbcId.split('-');

        // Extraer fechas del XML en formato YYYY-MM-DD
        let issueDateStr = xmlFile.getElementsByTagName("cbc:IssueDate")[0]?.childNodes[0]?.nodeValue || "null";
        let dueDateStr = xmlFile.getElementsByTagName("cbc:PaymentDueDate")[0]?.childNodes[0]?.nodeValue || "null";

        // Descomponer las fechas en año, mes y día
        let [issueYear, issueMonth, issueDay] = issueDateStr.split('-').map(Number);
        let [dueYear, dueMonth, dueDay] = dueDateStr.split('-').map(Number);

        // Calcular las diferencias
        let yearDiff = dueYear - issueYear;
        let monthDiff = dueMonth - issueMonth;
        let dayDiff = dueDay - issueDay;

        // Ajuste de diferencias si los días o meses son negativos
        if (dayDiff < 0) {
            monthDiff -= 1;
            // Sumar los días del mes anterior
            dayDiff += new Date(issueYear, issueMonth, 0).getDate();
        }

        if (monthDiff < 0) {
            yearDiff -= 1;
            monthDiff += 12;
        }

        // Formatear la diferencia en el formato "YYYY-MM-DD"
        let periodDifference = `${String(yearDiff).padStart(4, '0')}-${String(monthDiff).padStart(2, '0')}-${String(dayDiff).padStart(2, '0')}`;

        let data = {
            Periodo: periodDifference,
            Fecha_emision_comp: issueDateStr,
            Fecha_vencimiento_comp: dueDateStr,
            Tipo_comp: xmlFile.getElementsByTagName("cbc:InvoiceTypeCode")[0]?.childNodes[0]?.nodeValue || "null",
            Serie_comp: Serie_comp || "null", 
            Número_comp: Número_comp || "null",
            ---------------------------------------------

            ---------------------------------------------

            ------------------------------------------



        //     reference: xmlFile.getElementsByTagName("cbc:ID")[0]?.childNodes[0]?.nodeValue || "null",
        //     currentDate: currentDate,
        //     issueDate: xmlFile.getElementsByTagName("cbc:IssueDate")[0]?.childNodes[0]?.nodeValue || "null",
        //     taxAmount: xmlFile.getElementsByTagName("cbc:TaxAmount")[0]?.childNodes[0]?.nodeValue || "null",
        //     taxableAmount: xmlFile.getElementsByTagName("cbc:TaxableAmount")[0]?.childNodes[0]?.nodeValue || "null",
        //     payableAmount: parseFloat(xmlFile.getElementsByTagName("cbc:PayableAmount")[0]?.childNodes[0]?.nodeValue) || 0,
        //     description: xmlFile.getElementsByTagName("cbc:Description")[0]?.childNodes[0]?.nodeValue || "null",
        //     t_documento_emi: xmlFile.getElementsByTagName("cbc:RegistrationName")[0]?.childNodes[0]?.nodeValue || "null",

        //     ubl: xmlFile.getElementsByTagName("cbc:UBLVersionID")[0]?.childNodes[0]?.nodeValue || "null",
        //     V_estruc: xmlFile.getElementsByTagName("cbc:CustomizationID")[0]?.childNodes[0]?.nodeValue || "null",
        //     time_emi: xmlFile.getElementsByTagName("cbc:IssueTime")[0]?.childNodes[0]?.nodeValue || "null",
        //     Cod_docu: xmlFile.getElementsByTagName("cbc:InvoiceTypeCode")[0]?.childNodes[0]?.nodeValue || "null",
        //     leyenda: xmlFile.getElementsByTagName('cbc:Note')[0]?.childNodes[0]?.nodeValue || "null",
        //     Tp_mond: xmlFile.getElementsByTagName("cbc:DocumentCurrencyCode")[0]?.childNodes[0]?.nodeValue || "null",
        //     num_items: xmlFile.getElementsByTagName("cbc:LineCountNumeric")[0]?.childNodes[0]?.nodeValue || "null",
        //     Ruc: xmlFile.getElementsByTagName("cbc:ID")[2]?.childNodes[0]?.nodeValue || "null",
        //     cod_dom_fiscal: xmlFile.getElementsByTagName("cbc:AddressTypeCode")[0]?.childNodes[0]?.nodeValue || "null",
        //     name_adquiriente: xmlFile.getElementsByTagName("cbc:RegistrationName")[1]?.childNodes[0]?.nodeValue || "null",

        //    ruc_adquitiente: xmlFile.getElementsByTagName("cac:AccountingCustomerParty")[0]?.getElementsByTagName("cbc:ID")[0]?.childNodes[0]?.nodeValue || "null",
            
        //    Direc_adquiriente: xmlFile.getElementsByTagName("cbc:Line")[1]?.childNodes[0]?.nodeValue || "null",
        //     Direc_empresa: xmlFile.getElementsByTagName("cbc:Line")[0]?.childNodes[0]?.nodeValue || "null",
        //     cod_dom_fiscal_adquiriente: xmlFile.getElementsByTagName("cbc:AddressTypeCode")[1]?.childNodes[0]?.nodeValue || "null",

        //     // Nuevo campo para la condición de detracción o retención
        //     status: "no está sujeto a nada" // Valor predeterminado
        
        };

        // Verificar condiciones para detracción o retención
        let igvAmount = Array.from(xmlFile.getElementsByTagName("cbc:Name")).some(nameNode => nameNode.childNodes[0]?.nodeValue === "IGV");
        if (data.payableAmount > 700 && igvAmount) {
            // Verificar si alguna descripción contiene las palabras clave
            const keywords = [
                "digitalizacion","planos","servicio","intermediacion laboral", "arrendamiento", "mantenimiento", "reparacion", "movimiento",
                "comision", "fabricacion", "transporte", "contratos", "hidrobiológicos", "maiz amarillo",
                "caña de azúcar", "arena y piedra", "residuos", "subproductos", "desechos", "recortes", 
                "desperdicios", "bienes gravados con el igv por renuncia a la exoneración", 
                "carnes y despojos comestibles", "aceite de pescado", 
                "harina","polvo","pellets de pescado"," crustáceos", "moluscos", 
                "leche", "madera", "oro gravado con el igv", "paprika", 
                "minerales metálicos no auríferos", "oro", "plomo"
            ];
            
            let items = xmlFile.getElementsByTagName("cac:Item");
            let hasDetractionKeyword = false;
            
            for (let i = 0; i < items.length; i++) {
                let description = items[i].getElementsByTagName("cbc:Description")[0]?.childNodes[0]?.nodeValue || "";
                // Convertir la descripción a minúsculas
                description = description.toLowerCase(); 
                for (let keyword of keywords) {
                    // Convertir la palabra clave a minúsculas
                    if (description.includes(keyword.toLowerCase())) {
                        hasDetractionKeyword = true;
                        break; // Salir del bucle si se encuentra una palabra clave
                    }
                }
                if (hasDetractionKeyword) break; // Salir si se encontró una palabra clave
            }

            // Establecer el estado según los resultados
            if (hasDetractionKeyword) {
                data.status = "sujeto a detracción";
            } else {
                data.status = "sujeto a retención";
            }
        }

        // Insertar los datos en la tabla
        let cellIndex = 0;
        let row = TABLE.insertRow(1);
        for (const key in data) {
            let cell = row.insertCell(cellIndex);
            cell.innerHTML = "" + data[key];
            cellIndex++;
        }

        BTN.style.display = "block";
    };
});

BTN.addEventListener("click", function(){
    let result = [];
    let rowsQuantity = TABLE.rows.length;
    if (rowsQuantity > 1) for (let i = 0; i < rowsQuantity; i++) {
        let rowTemp = [];
        for (let j = 0; j < 7; j++) {
            rowTemp.push(TABLE.rows[i].cells[j].innerHTML);
        }
        result.push(rowTemp);
    }

    console.log(result);
    console.log(TABLE.outerHTML);

    let book = XLSX.utils.book_new();
    book.SheetNames.push("Sheet 1");
    let sheet = XLSX.utils.aoa_to_sheet(result);
    sheet["A1"].s = { font: { sz: 14, bold: true, color: { rgb: "FFFFAA00" } }, fill: { bgColor: { indexed: 64 }, fgColor: { rgb: "FFFF00" } } ,border: { top: { style: 'medium', color: { rgb: "FFFFAA00"}}, left: { style: 'medium', color: { rgb: "FFFFAA00"}}}};
    book.Sheets['Sheet 1'] = sheet; 
    let xlsxFile = XLSX.write(book, {bookType:'xlsx',  type: 'binary'});
    let arrayBuffer = new ArrayBuffer(xlsxFile.length);
    let uint8array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < xlsxFile.length; i++) uint8array[i] = xlsxFile.charCodeAt(i) & 0xff;
    saveAs(
        new Blob([arrayBuffer], { type: "application/octet-stream" }),"result.xlsx"
    );
    // let downloadLink = document.createElement("a");
    // downloadLink.href = 'data:' + 'application/vnd.ms-excel' + ', ' + TABLE.outerHTML.replace(/ /g, '%20');
    // downloadLink.download = 'data.xls';
    // downloadLink.click();
});