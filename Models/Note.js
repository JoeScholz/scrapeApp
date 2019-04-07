var mongoose = require("mongoose")

//use var for schema constructor
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
    titale: String,
    body: String
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;