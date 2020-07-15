var express = require('express')
var router = express.Router()

router.get('/', function (req, res){
    res.render("PlayGame", {
        user: req.session.user
    })
})

module.exports = router