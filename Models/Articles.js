var mongoose = require("mongoose");

var Schema = mogoose.Schema;

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
        type: { type: Schema.Types.ObjectId, 
        ref: "Note"},
    }
})

var Article = mongoose.model("Article", ArticleSchema);

//exporting var Article
module.exports = Article; 
