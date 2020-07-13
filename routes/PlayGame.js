var express = require('express')
var router = express.Router()

router.get('/', function (req, res){
    res.render("PlayGame")
})

module.exports = router