var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var Article = require("./models/Articles.js");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

mongoose.Promise = Promise;
var db = mongoose.connection;

var PORT = process.env.PORT || 3000;

// Require all models
var Article = require("./models/Articles.js");

// Initialize Express
var app = express();

// --------------------
// Configure middleware
// --------------------
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(bodyParser.urlencoded({ extended: true }));
// Make public a static folder
app.use(express.static("public"));

// Set Handlebars.

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/mongoHeadlines", { useNewUrlParser: true });
var databaseUri = "mongodb://localhost/mongoHeadlines";
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
}
else {
  mongoose.connect(databaseUri);
  console.log("Conneted to mongoHeadlines")
}

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Routes:

// A GET route for scraping the Onion website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.theonion.com/").then(function(response) {
  // Then, we load that into cheerio and save it to $ for a shorthand selector
  var $ = cheerio.load(response.data);

  $("article.post-item-frontpage").each(function(i, element) {
    // Save an empty result object

    var result = {};

    // Add the text and href of every link, and save them as properties of the result object
    result.title = $(this)
      .children("header")
      .children("h1")
      .text();
      console.log(result.title);
    result.summary = $(this)
      .children(".item__content")
      .children(".excerpt")
      .children("p")
      .text();
    result.link = $(this)
      .children("header")
      .children("h1")
      .children("a")
      .attr("href");

    // Check to see if the article already exists in the database; if it does, don't add another copy; 
    // but if it doesn't, then insert the article into the database
    Article.findOneAndUpdate({title: result.title}, result, {upsert: true})
      .then(function(dbArticle) {
        // View the added result in the console
        console.log(dbArticle);
        
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        return res.json(err);
      });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete - Hello");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/articles/clear", function(req, res){
  Article.remove().then(function(){
    res.send("Database cleared!");
  });
})

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.render("notes", {article: dbArticle});
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return Article.findOneAndUpdate(
        { 
        _id: req.params.id 
        },
        { 
        note: dbNote._id 
        },
        {
        new: true 
        }
     );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// handlebars object:
app.get("/", function(req, res) {
  Article.find({}, function(error, data) {
    var hbsObj = {
      article: data
    };
    console.log(hbsObj);
    res.render("index", hbsObj);
  });
});

app.get("/saved", function(req, res) {
  Article.find({"saved": true}).populate("notes").exec(function(error, articles) {
    var hbsObj = {
      article: articles
    };
    res.render("saved", hbsObj);
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});