var config = require('./config.js');
var fs = require('fs');
var express = require('express');
var mongodb = require('mongodb');

var debug = require('debug')(__filename.substr(__dirname.length + 1));

var app = express();
app.listen(config.port, config.hostname);

mongodb.MongoClient.connect(config.dburl, function(err, db) {
	if(err) throw err;
	console.log('Connected to the database.');
	app.locals.db = db;
});
app.locals.siteName = app.locals.pageTitle = config.siteName;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/public'));

app.use('/', require('./routes/index.js'));
app.use('/api', require('./routes/api.js'));

app.use(function(req, res) {
	res.status(404).render('404', {
		config: config,
		orignalUrl: req.orignalUrl
	});
});
