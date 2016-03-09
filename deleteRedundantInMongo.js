/**
 * @file 刪除 MongoDB 中重複的資料。
 */

/**
 * MongoDB 資料庫設定。
 */
var dburl = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost:27017/';
var dbname = process.env.OPENSHIFT_APP_NAME || 'ey-gazette';
var collName = 'records';

/**
 * 載入所需套件。
 */
var async = require('async');
var mongodb = require('mongodb');

mongodb.MongoClient.connect(dburl + dbname, function(err, db) {
	if(err) return console.error(err);
	console.log('Connected to DB');
	var coll = db.collection(collName);
	var callback = function(err) {
		if(err) console.error(err);
		console.log('Disconnecting from DB');
		return db.close();
	};
	
	coll.aggregate(
		{$group: {_id: '$MetaId', count: {$sum: 1}}},
		function(err, docs) {
			if(err) return callback(err);
			async.eachSeries(docs, function(doc, next) {
				if(doc.count === 1) return setImmediate(next);
				var id = doc._id;
				console.log(id + ' : ' + doc.count);
				
				async.timesSeries(doc.count - 1, function(n, next) {
					coll.deleteOne({'MetaId': id}, next);
				}, next);
			}, callback);
		}
	);
});
