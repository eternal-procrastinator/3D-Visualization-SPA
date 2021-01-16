const express = require('express')
const path = require('path')
const app = express()

const { TriangulateCube, TriangulateCone } = require('./additional/triangulation')

let Params = {
    cubeParams: {
        length: '50',
        width: '50',
        height: '50',
    },
    coneParams: {
        radius: '50',
        height: '50',
        segments: '10',
    }
}

app.use(express.json())

app.get('/api/triangulation', (req, res) => {
    console.log(Params)
    res.status(200).json(Params)
})

app.post('/api/triangulation', (req, res) => {
    switch (req.body.Type) {
        case 'cube':
            Params.cubeParams = req.body.Params
            res.status(202).json(JSON.stringify(TriangulateCube(Params.cubeParams)))
            break
        case 'cone':
            Params.coneParams = req.body.Params
            res.status(202).json(JSON.stringify(TriangulateCone(Params.coneParams)))
            break
    }
    console.log(Params)
})

app.use(express.static(path.resolve(__dirname, 'src')))

let server = app.listen(process.env.PORT || 8080, function(){
    let port = server.address().port
    console.log('Server running on port', port)
})