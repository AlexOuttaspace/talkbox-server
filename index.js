require('dotenv').config()

const express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),

    app = express(),

    PORT = process.env.PORT || 1994

app.use(cors())

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('hi there')
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
