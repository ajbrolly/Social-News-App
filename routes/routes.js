var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");
var pug = require('pug');

function Article(title, link) {
	this.title = title;
	this.link = link;
};


module.exports = function (app) {

	app.get("/", function (req, res) {
		res.redirect('/scrape');
	});

	// A GET route for scraping the echojs website
	app.get("/scrape", function (req, res) {
		// First, we grab the body of the html with request
		axios.get("https://www.reddit.com/r/worldnews/").then(function (response) {
			// Then, we load that into cheerio and save it to $ for a shorthand selector
			var $ = cheerio.load(response.data);

			$("p.title").each(function (i, element) {
				// Save an empty result object
				var result = {};

				// Add the text and href of every link, and save them as properties of the result object
				result.title = $(this)
					.text();
				result.link = $(this)
					.children("a")
					.attr("href");


				// Trying to eliminate duplicate articles in my scrape
				// but code below currently crashes server
				// ------------------------------------------------------------
				// 	if (result.title !== "" && result.link !== "") {
				// 		if (titlesArray.indexOf(result.title) == -1) {
				// 			titlesArray.push(result.title);
				// 			// Only add the entry to the database if is not already there
				// 			db.Headline.count({ title: result.title }, function (err, test) {
				// 				// If the count is 0, then the entry is unique and should be saved
				// 				if (test == 0) {
				// 					// Using the Headline model, create a new entry
				// 					var entry = new Headline(result);
				// 					// Save the entry to MongoDB
				// 					entry.save(function (err, data) {
				// 						// log any errors
				// 						if (err) {
				// 							console.log(err);
				// 						}
				// 						// or log the data that was saved to the DB
				// 						else {
				// 							console.log(data);
				// 						}
				// 					});
				// 				}
				// 				// Log that scrape is working, just the content was already in the Database
				// 				else {
				// 					console.log('Redundant Database Content. Not saved to DB.')
				// 				}
				// 			});
				// 		}
				// 	}
				// 	// Log that scrape is working, just the content was missing parts
				// 	else {
				// 		console.log('Empty Content. Not Saved to DB.')
				// 	}

				// Create a new Article using the `result` object built from scraping
				db.Headline
					.create(result)
					.then(function (dbHeadline) {
						// If we were able to successfully scrape and save an Article, send a message to the client
						// res.send("Scrape Complete");
						res.redirect('/articles');
					})
					.catch(function (err) {
						// If an error occurred, send it to the client
						res.json(err);
					});
			});
		});
	});

	// Route for getting all Articles from the db
	app.get("/api/articles", function (req, res) {
		// TODO: Finish the route so it grabs all of the articles
		db.Headline.find({})
			.then(function (dbHeadline) {
				res.json(dbHeadline);
				var articles = [];
				//loop through data in SQL
				for (var i = 0; i < dbHeadline.length; i++) {
					//shortcut syntax for returned data
					var iteration = dbHeadline[i].dataValues;
					//run constructor with relevant data passed as arguments
					var singleArticle = new Article(iteration.title, iteration.link);
					//push current iteration of constructed object into array
					articles.push(singleArticle);
				}
				res.render('index', { "articleData": articles });

			})
			.catch(function (err) {
				res.status(401).send(err);
			})
	});

	// Route for getting all Articles from the db
	app.get("/articles", function (req, res) {
		res.render('index');
	});

	// Route for grabbing a specific Article by id, populate it with it's note
	app.get("/api/articles/:id", function (req, res) {

		db.Headline.findOne({ _id: req.params.id })
			.populate('note')
			.then(function (dbHeadline) {
				res.json(dbHeadline);
			})
			.catch(function (err) {
				res.status(401).send(err);
			})
	});

	// Route for saving/updating an Article's associated Note
	app.post("/api/articles/:id", function (req, res) {
		db.Note.create(req.body)
			.then(function (dbNote) {
				return db.Headline.findOneAndUpdate(
					{ _id: req.params.id },
					{
						$set:
							{ note: dbNote._id }
					},
					{ new: true });

			})
			.then(function (dbHeadline) {
				res.json(dbHeadline);
			})
			.catch(function (err) {
				res.json(err);
			});
	});



};