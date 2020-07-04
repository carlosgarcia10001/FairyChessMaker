var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var fs = require('fs')
const app = express()
const port = 3000

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({parameterLimit: 5000, extended: true}))
app.use(bodyParser.json())
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,"public","html","GameCreator.html"))
})
app.get('/play', (req, res) => {
    res.sendFile(path.join(__dirname,"public","html","PlayGame.html"))
})
app.post('/',function(req, res, next){
    console.log(bodyParser.limit)
    fs.appendFile('CustomChessPieces.txt',JSON.stringify(req.body), function(err){
        if (err) throw err;
        console.log("File saved")
    })
    res.redirect('/')
});
app.listen(port, () => console.log("app running"))