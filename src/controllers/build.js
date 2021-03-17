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
  const uppercaseDevName = devInfo.name.split('').map(char => char.toUpperCase()).join('');
  const items = invoice.invoiceInfo.invoiceItems;
  let subtotal = normalize(invoice.invoiceInfo.subtotal);
  let discount = normalize(invoice.invoiceInfo.discountValue);
  let taxes = normalize(invoice.invoiceInfo.stableTaxValue);
  let total = normalize(invoice.invoiceInfo.total);
  const notes = breakIntoLines(invoice.notes);

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
    .moveTo(leftMargin - 34, 75)
    .fontSize(32)
    .text('Invoice')
    .fillColor('#000')
    .fontSize(24)
    .text('$' + invoice.invoiceInfo.total, (docWidth - (invoice.invoiceInfo.total.length > 7 ? 230 : 180)), 75)
    .fontSize(10)
    .text('Due: ' + date, (docWidth - (invoice.invoiceInfo.total.length > 7 ? 220 : 170)), 115)
    .fontSize(12)
    .text(uppercaseClientName, leftMargin, 150)
    .text(customerInfo.street, leftMargin, 170)
    .text(customerInfo.city + ', ' + customerInfo.USstate + ' ' + (customerInfo.zip || ''), leftMargin, 190)
    .lineWidth(1)
    .strokeColor('#dcdcdc')

    let y = 270;
    let increment = 36;
    doc
    .text('Description', leftMargin, y -22)
    .text('Unit', leftMargin + 186, y -22)
    .text('Rate', leftMargin + 275, y -22)
    .text('Total', leftMargin + 400, y -22)

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
      .text('$' + item.total, leftMargin + 400, y + 11)
      y += increment;
    }

    if (notes) {
      y = 480;
      doc
      .fontSize(9)
      .font('src/assets/Roboto/Roboto-Medium.ttf')
      .text('Notes', leftMargin, y)
      .font('src/assets/Roboto/Roboto-Light.ttf')
      y += 5
      for (let j = 0; j < notes.length; j++) {
        y += 15;
        doc.text(notes[j], leftMargin, y)
      }
    }
  
    y = 480;
    increment = 30;
    doc
    .fontSize(12)
    .font('src/assets/Roboto/Roboto-Light.ttf')
    .text('Subtotal', leftMargin + 275, y)
    .text(subtotal, leftMargin + 400 , y)
    .moveTo(leftMargin + 275, y + 21)
    .lineTo(docWidth - rightMargin, y + 21)
    .stroke()
    y += increment;
    if (discount) {
      doc
      .text('Discount', leftMargin + 275, y)
      .font('src/assets/Roboto/Roboto-Light.ttf')
      .text('- ' + discount, leftMargin + 400 , y)
      .moveTo(leftMargin + 275, y + 21)
      .lineTo(docWidth - rightMargin, y + 21)
      .stroke()
      y += increment;
    }
    if (taxes) {
      doc
      .text('Taxes', leftMargin + 275, y)
      .font('src/assets/Roboto/Roboto-Light.ttf')
      .text('+ ' + taxes, leftMargin + 400 , y)
      .moveTo(leftMargin + 275, y + 21)
      .lineTo(docWidth - rightMargin, y + 21)
      .stroke()
      y += increment;
    }
    doc
    .text('Total', leftMargin + 275, y)
    .font('src/assets/Roboto/Roboto-Light.ttf')
    .text(total, leftMargin + 400 , y)
    .moveTo(leftMargin + 275, y + 21)
    .lineTo(docWidth - rightMargin, y + 21)
    .stroke()
    y += increment;

    doc
    .font('src/assets/Roboto/Roboto-Medium.ttf')
    .text('Amount Due', leftMargin + 275, y)
    .text(total, leftMargin + 400 , y)

    y = 652;
    doc
    .moveTo(leftMargin, y)
    .lineTo(docWidth - rightMargin, y)
    .stroke()

    y+= 10;
    doc
    .fontSize(12)
    .text(uppercaseDevName, leftMargin, y)
    .text(devInfo.street, leftMargin, y + 20)
    .text(devInfo.city + ', ' + devInfo.USstate + ' ' + (devInfo.zip || ''), leftMargin, y + 40);
    
    doc.end();
    const url = await uploadFile(fileName, doc);
    console.log(url)
    return url;
  } catch(e) {
    console.log(e)
    return e;
  }
  
}

const normalize = (text) => {
  console.log(text)
  if (!text) return '';
  text = text.toString().trim();
  let arr = text.split('');

  if (arr[0] !== '$') arr.unshift('$');

  let i = arr.length;
  while (i < 13) {
    arr.unshift(' ');
    i++;
  }

  if (arr.indexOf('.') && arr.indexOf('.') < arr.length - 2) {
    arr = arr.slice(0, arr.indexOf('.') + 2)
  }
  if (arr.indexOf('.' && arr.indexOf('.') === arr.length - 1)) arr.push('0');

  i = arr.length;
  while (i < 13) {
    arr.unshift(' ');
    i++;
  }

  return arr.slice(arr.length - 11, arr.length).join('');
}

const breakIntoLines = (text) => {
  if (!text) return null;
  let output = [];
  let running = '';
  let i = 0;
  while (i < text.length) {
    running += text[i];
    if (i !== 0 && i % 40 === 0) {
      if (text[i + 1] === ' ' || text[i + 1] === '.' || text[i + 1] === ',') {
        i++;
        running += text[i];
      }
      output.push(running);
      running = '';
    }
    i++;
  }
  output.push(running);
  return output;
}

module.exports = { build };