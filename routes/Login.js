var express = require('express')
var router = express.Router()

router.get('/', (req, res) =>{
    res.render('login')
})
router.post('/', (req,res) => {
    res.redirect('/login')
})

module.exports = router