const express = require('express')
const { build } = require('../controllers/build');
const cors = require('cors');
const router = new express.Router()

router.post('/build', cors(), async (req, res) => {
    try {
        const url = await build(req.body);
        res.status(200).send({ url });
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router