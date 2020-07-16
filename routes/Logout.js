var express = require('express')
var router = express.Router()

router.get('/', function(req, res){
    if(req.session.user){
        delete req.session.user
    }
    res.redirect('back')
})

module.exports = router