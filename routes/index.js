var express = require('express');

var router = module.exports = express.Router();

router.get('/', function(req, res, next) {
	var date = res.locals.date = req.query.date || req.app.locals.lastUpdate;
	var coll = req.app.locals.db.collection('records');
	req.app.locals.db.collection('records').find({gazetteDate: date}).toArray(function(err, docs) {
		if(err) return next(err);
		date = new Date(res.locals.date);
		res.locals.prevDate = (new Date(date.getTime()-86400000)).toISOString().substr(0, 10);
		res.locals.nextDate = (new Date(date.getTime()+86400000)).toISOString().substr(0, 10);
		res.render('index', {docs: docs});
	});
});
