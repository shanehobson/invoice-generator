const { uploadFile } = require('./s3.js');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { v4 } = require('uuid');

const build = async (invoice) => {

  let dateArray = new Date(invoice.invoiceInfo.date).toString().split(' ');
  const date = dateArray[1] + ' ' + dateArray[2] + ' ,' + dateArray[3];

  try {
    console.log('Received invoice', invoice)
    const fileName = v4() + '.pdf';
    let doc = new PDFDocument;
    const docWidth = 612;
    doc.pipe(fs.createWriteStream(`src/files/${fileName}`))
    doc
    .font('src/assets/Roboto/Roboto-Medium.ttf')
    .lineWidth(8)
    .strokeColor(invoice.colors.standard)
    .fillColor(invoice.colors.standard)
    .moveTo(0, 0)
    .lineTo(docWidth, 0)
    .stroke()
    .moveTo(40, 85)
    .fontSize(32)
    .text('Invoice')
    .fillColor('#000')
    .fontSize(24)
    .text('$' + invoice.invoiceInfo.total, (docWidth - (invoice.invoiceInfo.total.length > 7 ? 230 : 180)), 85)
    .fontSize(10)
    .text('Due: ' + date, (docWidth - (invoice.invoiceInfo.total.length > 7 ? 220 : 170)), 122)
    
    doc.end();
    const url = await uploadFile(fileName, doc);
    console.log(url)
    return url;
  } catch(e) {
    console.log(e)
    return e;
  }
  
}

module.exports = { build };