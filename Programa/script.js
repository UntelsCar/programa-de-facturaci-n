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

        let data = {
            reference: xmlFile.getElementsByTagName("cbc:ID")[0].childNodes[0].nodeValue,
            currentDate: currentDate,
            issueDate: xmlFile.getElementsByTagName("cbc:IssueDate")[0].childNodes[0].nodeValue,
            taxAmount: xmlFile.getElementsByTagName("cbc:TaxAmount")[0].childNodes[0].nodeValue,
            taxableAmount: xmlFile.getElementsByTagName("cbc:TaxableAmount")[0].childNodes[0].nodeValue,
            payableAmount: xmlFile.getElementsByTagName("cbc:PayableAmount")[0].childNodes[0].nodeValue,
            description: xmlFile.getElementsByTagName("cbc:Description")[0].childNodes[0].nodeValue
        };

        let cellIndex = 0;
        let row = TABLE.insertRow(1);
        for (const key in data) {
            let cell = row.insertCell(cellIndex);
            cell.innerHTML = "" + data[key];
            cellIndex++;
        }

        BTN.style.display = "block";
    }
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