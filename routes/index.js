var express = require('express');

var router = module.exports = express.Router();

router.get('/', function(req, res, next) {
	var date = res.locals.date = req.query.date || req.app.locals.lastUpdate;
	var coll = req.app.locals.db.collection('records');
	req.app.locals.db.collection('records').find({gazetteDate: date}).toArray(function(err, docs) {
		if(err) return next(err);
		date = new Date(date);
		res.render('index', {
			pageTitle: req.query.date, // 只在真的有指定日期時指定，否則應為「首頁」。
			prevDate: (new Date(date.getTime()-86400000)).toISOString().substr(0, 10),
			nextDate: (new Date(date.getTime()+86400000)).toISOString().substr(0, 10),
			docs: docs
		});
	});
});
