// Parses our HTML and helps us find elements
var cheerio = require("cheerio");
// Makes HTTP request for HTML page
var axios = require("axios");

var express = require("express");
var path = require("path");
var PORT = process.env.PORT || 3000 

const db = require("./models");

console.log("\n***********************************\n" +
            "Grabbing Headlines, Summary and URLS\n" +
            "from new Huffpost articles:" +
            "\n***********************************\n");            
var app = express();

app.use(logger("dev"));

app.use(logger("dev"));

app.use(express.static("Public"));

app.get("/detail", function(req, res){
    res.sendFile(path.join(__dirname, "/Public/detail.html"))
})

app.listen(PORT, function(){
    console.log("listening on port: " + PORT)
})