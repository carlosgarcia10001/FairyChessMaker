var express = require('express')
var router = express.Router()

router.get('/', function(req, res){
    req.session.destroy()
    res.redirect('back')
})

module.exports = router