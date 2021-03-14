const { uploadFile } = require('./s3.js');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { v4 } = require('uuid');

const build = async (invoice) => {
  console.log('Received invoice', invoice)
  const fileName = v4() + '.pdf';
  let pdfDoc = new PDFDocument;
  pdfDoc.pipe(fs.createWriteStream(`src/files/${fileName}`));
  pdfDoc.text(JSON.stringify(invoice));
  pdfDoc.end();
  const url = await uploadFile(fileName, pdfDoc);
  return url;
}

module.exports = { build };