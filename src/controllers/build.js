const { uploadFile } = require('./s3.js');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { v4 } = require('uuid');

const build = async (invoice) => {

  // config
  const docWidth = 612;
  const leftMargin = 74;
  const rightMargin = 74;

  // variables
  let dateArray = new Date(invoice.invoiceInfo.date).toString().split(' ');
  const date = dateArray[1] + ' ' + dateArray[2] + ' ,' + dateArray[3];
  const customerInfo = invoice.invoiceInfo.customerInfo;
  const uppercaseClientName = customerInfo.name.split('').map(char => char.toUpperCase()).join('');
  const devInfo = invoice.invoiceInfo.devInfo;
  const items = invoice.invoiceInfo.invoiceItems;
  // 

  try {
    console.log('Received invoice', invoice)
    const fileName = v4() + '.pdf';
    let doc = new PDFDocument;
    doc.pipe(fs.createWriteStream(`src/files/${fileName}`))
    doc
    .font('src/assets/Roboto/Roboto-Medium.ttf')
    .lineWidth(8)
    .strokeColor(invoice.colors.standard)
    .fillColor(invoice.colors.standard)
    .moveTo(0, 0)
    .lineTo(docWidth, 0)
    .stroke()
    .moveTo(leftMargin - 34, 85)
    .fontSize(32)
    .text('Invoice')
    .fillColor('#000')
    .fontSize(24)
    .text('$' + invoice.invoiceInfo.total, (docWidth - (invoice.invoiceInfo.total.length > 7 ? 230 : 180)), 85)
    .fontSize(10)
    .text('Due: ' + date, (docWidth - (invoice.invoiceInfo.total.length > 7 ? 220 : 170)), 122)
    .fontSize(12)
    .text(uppercaseClientName, leftMargin, 158)
    .text(customerInfo.street, leftMargin, 178)
    .text(customerInfo.city + ', ' + customerInfo.USstate + ' ' + (customerInfo.zip || ''), leftMargin, 198)
    .lineWidth(1)
    .strokeColor('#dcdcdc')

    let y = 280;
    let increment = 36;
    doc
    .text('Description', leftMargin, y -22)
    .text('Unit', leftMargin + 186, y -22)
    .text('Rate', leftMargin + 275, y -22)
    .text('Total', leftMargin + 410, y -22)

    doc.font('src/assets/Roboto/Roboto-Light.ttf')
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      doc
      .moveTo(leftMargin, y)
      .lineTo(docWidth - rightMargin, y)
      .stroke()
      .text(item.description, leftMargin, y + 11)
      .text(item.unit, leftMargin + 190, y + 11)
      .text(item.feeType !== 'Flat fee' ? '$' + item.rate + '/' + item.feeType : item.feeType === 'Flat fee' && '$' + item.rate, leftMargin + 275, y + 11)
      .text('$' + item.total, leftMargin + 410, y + 11)
      y += increment;
    }
    
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