# Invoice Generator API

The back end of Invoice Generator: a Node.js/Express service that takes invoice data from the front end, lays out a branded PDF invoice with PDFKit, uploads it to Amazon S3, and returns the file's URL.

**Front end:** [shanehobson/invoice-generator-fe](https://github.com/shanehobson/invoice-generator-fe)

## Features

- A single `POST /build` endpoint that turns a JSON invoice into a PDF
- Invoice layout drawn with PDFKit using the bundled Roboto fonts:
  - a header bar and title in the user's chosen brand color
  - the amount due and due date
  - the client's name and address
  - a line-item table with description, units, rate (flat fee, or per hour, day, and so on), and line total
  - optional notes, wrapped to fit the page
  - subtotal, with discount and tax rows shown only when they apply, then the total and amount due
  - the developer's name and address in the footer
- Each PDF gets a UUID file name, is uploaded to S3 as a publicly readable object, and its URL is returned to the client, which opens it in a new tab

## Tech stack

- Node.js, Express, and `cors`
- PDFKit
- AWS SDK for JavaScript (v2), for S3
- `uuid`

## API

### `POST /build`

The request body is the invoice state sent by the front end. The fields the builder reads are:

```jsonc
{
  "colors": { "standard": "#4cae4f" },
  "notes": "Optional free-text notes",
  "invoiceInfo": {
    "date": "2021-03-31T00:00:00.000Z",
    "devInfo":      { "name": "", "street": "", "city": "", "USstate": "", "zip": "" },
    "customerInfo": { "name": "", "street": "", "city": "", "USstate": "", "zip": "" },
    "invoiceItems": [
      { "description": "", "unit": "1", "rate": "100", "feeType": "Per hour", "total": "100.00" }
    ],
    "subtotal": "100.00",
    "discountValue": 0,
    "stableTaxValue": "",
    "total": "100.00"
  }
}
```

Response:

```json
{ "url": "<S3 object URL for <uuid>.pdf>" }
```

## Getting started

```bash
npm install
mkdir -p src/files      # PDFKit writes a local copy here; the folder is gitignored
npm run dev             # nodemon, restarts on file changes
# or
npm start
```

Configuration:

- `PORT`: the port to listen on. Defaults to `3002`.
- AWS credentials are read from `src/secrets.json`, which is gitignored and must contain `publicKey` and `privateKey` keys. The bucket name (`form-tree-invoices`) is set in `src/controllers/s3.js`. Point it at a bucket you control.

## Project structure

```
src/
  index.js              # Express app setup
  routers/main.js       # POST /build
  controllers/build.js  # PDF layout with PDFKit
  controllers/s3.js     # Upload to S3
  assets/Roboto/        # Fonts embedded in the PDF
```

`src/middleware/auth.js` is an unused JWT middleware stub. No routes use it.

## Related

- [invoice-generator-fe](https://github.com/shanehobson/invoice-generator-fe): the React/Redux front end for this API
- [contract-generator](https://github.com/shanehobson/contract-generator): a companion tool that generates web development services contracts
