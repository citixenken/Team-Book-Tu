var express = require('express');
var router = express.Router();

/* GET booklist. */
router.get('/booklist', function(req, res, next) {
    var db = req.db;
    var collection = db.get('booklist');
    collection.find({},{},function(e, docs){
        res.json(docs);
    });
});

/* POST to addbook */

router.post('/addbook', function(req, res, next) {
    var db = req.db;
    var collection = db.get('booklist');
    collection.insert(req.body, function(err, result){
        res.send((err === null) ? {msg : ''} : {msg : err});
    });

});

/* DELETE to delete book */


router.delete('/deletebook/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('booklist');
    var bookToDelete = req.params.id;
    collection.remove({ '_id' : bookToDelete }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/* UPDATE book information
 router.put(){}
 */

module.exports = router;
