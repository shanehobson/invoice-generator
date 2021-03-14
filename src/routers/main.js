const express = require('express')
const Invoice = require('../models/invoice')
const { build } = require('../controllers/build');
const cors = require('cors');
const router = new express.Router()


router.post('/build', cors(), async (req, res) => {
    const invoice = new Invoice(req.body);
    try {
        const url = await build(invoice);
        res.status(200).send({ url });
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router