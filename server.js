// Dependencies
// ----------------------------------------
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var pug = require('pug');
var path = require('path');

// Scraping tools
// ----------------------------------------
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
// ----------------------------------------
var db = require("./models");


// Express
// ----------------------------------------
var PORT = process.env.PORT || 3000;
var app = express();


// Configure middleware
// ----------------------------------------
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Pug
// ----------------------------------------
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// Default Path
// ----------------------------------------
// app.get("/", function (req, res) {
// 	res.render('index');
// });

// Routes
require('./routes/routes.js')(app);


// Database Configuration with Mongoose
// ----------------------------------------
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
	useMongoClient: true
});


// Start the server
// ----------------------------------------
app.listen(PORT, function () {
	console.log("App running on port " + PORT + "!");
});


// Error Handling
// ----------------------------------------
app.use(function (err, req, res, next) {
	if (!err) {
		next();
	}
	console.log(err);
	res
		.status(500)
		.json({
			error: 500,
			message: err.message
		});
});