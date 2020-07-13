var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database conneceted")
    db.db('FairyChessMaker').collection("Users").insertOne({
        'first_name': 'Daae',
        'last_name': 'Dooe'
    })
    db.db('FairyChessMaker').collection("Users").findOne({'last_name': 'Dooe'}, function(err,result){
        if (err) throw err;
    console.log(result.first_name);
    db.close();
    })
  });