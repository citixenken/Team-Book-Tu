var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bookSchema = new mongoose.Schema({
	userId: { type: String },
	booktitle: { type: String, required: true, unique: true},
	authorname: { type: String, required: true, unique: true},
	isbn: { type: String, required: true }
});

var Book = mongoose.model('Book', bookSchema);
module.exports = Book;
