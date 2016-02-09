/**
 * @file 把已下載的 XML 轉換成 JS 物件、匯入 MongoDB 。
 */

/**
 * MongoDB 資料庫 URL 。若設為偽，即不存取資料庫。
 * @var {string} dburl
 * @var {string} collName
 */
var dburl = 'mongodb://localhost:27017/ey-gazette';
var collName = 'records';

/**
 * 設定是否輸出 JSON 檔。（將存於與各 XML 檔同一目錄）
 * @var {boolean} outputJSON
 */
var outputJSON = false;

/**
 * 全域變數們。
 * @var {Collection} coll MongoDB Collection.
 */
var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');
var coll;

if(dburl) require('mongodb').MongoClient.connect(dburl, function(err, db) {
	if(err) return console.error('Error: cannot connect database');
	coll = db.collection(collName);
	coll.drop(function() {main(db);});
});
else main();

//
// Functions
//
function main(db) {
	fs.readdir('./data', function(err, dirs) {
		if(err) return console.error('Error: no `data` directory to import');
		parseByYear(dirs, 0, function() {
			if(db) db.close();
			console.log('Finish');
		});
	});
}

function parseByYear(years, index, callback) {
	if(index == years.length) return setImmediate(callback);
	var next = function(msg, err) {
		if(msg) console[err ? 'error' : 'log'](msg);
		setImmediate(parseByYear, years, index + 1, callback);
	};
	var year = years[index];
	var dir = './data/' + year;
	fs.readdir(dir, function(err, dirs) {
		if(err) return next('Warning: failed to read dir ' + dir, err);
		if(isNaN(parseInt(year, 10)))
			return next('Warning: skipping unknown dir ' + year, true);
		parseByDate(dirs, 0, next);
	});
}

function parseByDate(dates, index, callback) {
	if(index == dates.length) return setImmediate(callback);
	var next = function(msg, err){
		if(msg) console[err ? 'error' : 'log'](msg);
		setImmediate(parseByDate, dates, index + 1, callback);
	};
	var dateStr = dates[index];
	var yearStr = dateStr.substr(0, 3);
	var split = dateStr.split('-').map(function(num) {return parseInt(num, 10);});
	if(split.length != 3 || split.some(isNaN))
		return next('Warning: skipping unknown dir ' + dateStr, true);
	split[0] += 1911;
	var dateCEStr = (new Date(split.join('-'))).toISOString().substr(0, 10);

	fs.readFile(
		util.format('./data/%s/%s/%s.xml', yearStr, dateStr, dateStr),
		'utf8',
		function(err, xml) {
			if(err) return next('Error: error on file reading', err);
			xml2js.parseString(xml, function(err, res) {
				if(err) return next('Error: XML parsing error of ' + dateStr, err);
				try {
					var records = res.Gazette.Record;
					records.forEach(function(rec) {
						//delete rec.HTMLContent;
						for(var i in rec) {
							if(!Array.isArray(rec[i]) || rec[i].length != 1)
								return console.error('Error: uknown format of some record');
							var val = rec[i][0];
							if(val) rec[i] = val;
							else delete rec[i];
						}
						rec.gazetteDate = dateCEStr;
					});
				}
				catch(err) {return next('Error: xmlDoc with wrong structure ' + dateStr, err);}

				if(outputJSON) fs.writeFileSync(
					util.format('./data/%s/%s/%s.json', yearStr, dateStr, dateStr),
					JSON.stringify(records, null, '\t').replace(/\n\t+/g, '\n')
				);
				if(coll) coll.insertMany(records, function(err) {
					next('Finished importing gazette with date ' + dateStr, err);
				});
				else next(dateStr);
			});
		}
	);
}
