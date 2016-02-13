var config = require('./config.js');
var fs = require('fs');
var express = require('express');
var mongodb = require('mongodb');
var async = require('async');

var debug = require('debug')(__filename.substr(__dirname.length + 1));

var app = express();
app.listen(config.port, config.hostname);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

/**
 * Routers.
 */
app.use(express.static(__dirname + '/public'));

app.use('/', require('./routes/index.js'));
app.use('/field', require('./routes/field.js'));
app.use('/article', require('./routes/article.js'));
app.use('/api', require('./routes/api.js'));

app.use(function(req, res) {
	res.status(404).render('404', {
		config: config,
		orignalUrl: req.orignalUrl
	});
});

/**
 * Settings.
 */
app.locals.siteName = app.locals.pageTitle = config.siteName;
async.parallel([
	function(callback) {
		mongodb.MongoClient.connect(config.dburl, callback);
	},
	function(callback) {
		fs.readFile('./public/meta/fieldTitles.json', 'utf8', callback);
	}
], function(err, res) {
	if(err) throw err;
	debug('Connected to database');
	app.locals.db = res[0];
	var coll = res[0].collection('records');
	var fields = {};
	async.forEachOfSeries(
		JSON.parse(res[1]),
		function(title, field, callback) {
			var info = {title: title};
			fields[field] = info;
			if(config.distinctFields.indexOf(field) == -1)
				return setImmediate(callback);
			coll.distinct(field, function(err, docs) {
				if(err) return callback(err);
				info.options = docs;
				setImmediate(callback);
			});
		},
		function(err) {
			if(err) throw err;
			debug('Loaded categories');
			app.locals.fields = fields;
		}
	);
});
