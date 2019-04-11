var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema ({

    title:{
        type: String,
        required: true,
        unique: true
    },

    link:{
        type: String,
        required: true,
        unique: true
    },

    summary:{
        type: String,
        required: false,
        unique: false
    },

    note: {
        type: Schema.Types.ObjectId, 
        ref: "Note",
    }
})

var Article = mongoose.model("Articles", ArticleSchema);

//exporting var Article
module.exports = Article; 
