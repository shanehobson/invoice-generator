const AWS = require('aws-sdk');
const bucketName = 'form-tree-invoices'
const fs = require('fs');
const region = 'us-east-2';
const secrets = require('../secrets.json');

const uploadFile = async (fileName, fileContent) => {

  const publicKey = secrets.publicKey;
  const privateKey = secrets.privateKey;

  const s3 = new AWS.S3({
    accessKeyId: publicKey,
    secretAccessKey: privateKey
  });

  // Setting up S3 upload parameters
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ACL: 'public-read' // Make this object public
  };

  // Uploading files to the bucket
  return await new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => err == null ? resolve(data.Location) : reject(err));
  });
};

module.exports = { uploadFile };