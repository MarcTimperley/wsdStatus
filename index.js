const express = require('express')
const helmet = require('helmet')
const app = express()
const path = require('path')
const getStatusReport = require('./server/getStatusReport')
require('dotenv').config()
const interval = process.env.INTERVAL || 300
app.use(helmet()) // implement basic security on the express server

app.listen(process.env.PORT || 3000)
app.use(express.static('public'))
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '/public/index.html')) })
console.log(`server started on port ${process.env.PORT || 3000}`)
getStatusReport() // get initial report on server startup
setInterval(() => getStatusReport(), 1e3 * interval) // interval in seconds between getting a new status report
