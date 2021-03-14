const express = require('express')
const router = require('./routers/main')
const cors = require('cors');

const app = express()
const port = process.env.PORT || 3000

app.use(cors());
app.use(express.json())
app.use(router)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})