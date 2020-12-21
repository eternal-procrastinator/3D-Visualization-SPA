const express = require('express')
const path = require('path')
const app = express()

const { Triangulate } = require('./additional/triangulation')

let Params = {
    length: '50',
    width: '50',
    height: '50'
}

app.use(express.json())

app.get('/api/triangulation', (req, res) => {
    res.status(200).json(Params)
})

app.post('/api/triangulation', (req, res) => {
    Params = req.body
    res.status(202).json(JSON.stringify(Triangulate(Params)))
})

app.use(express.static(path.resolve(__dirname, 'src')))

let server = app.listen(process.env.PORT || 8080, function(){
    let port = server.address().port
    console.log('Server running on port', port)
})