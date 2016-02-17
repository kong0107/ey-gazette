/**
 * @file 把已下載的 XML 轉換成 JS 物件、匯入 MongoDB 。
 */

/**
 * 設定是否要儲存／輸出會佔掉約七成空間的 `HTMLContent` 欄位。
 */
var deleteHTMLContent = true;

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
 * 載入所需套件。
 */
var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');

/**
 * 其他全域變數。
 * @var {Collection} coll MongoDB Collection
 * @var {string} dataDir 存放 XML 檔的路徑，也是輸出 JSON 時的存放路徑。
 * @var {array} arrayFields 指定哪些欄位是 comma-separated ，將拆成陣列。
 */
var coll;
var dataDir = './data/';
var arrayFields = ['PubGovName', 'UndertakeGov', 'Officer_name', 'GazetteId', 'Keyword', 'Eng_Keyword', 'Category', 'Cake', 'Service'];

//
// Start
//
if(dburl) require('mongodb').MongoClient.connect(dburl, function(err, db) {
	if(err) return console.error('Error: cannot connect database');
	coll = db.collection(collName);
	main(db);
});
else main();

//
// Functions
//
function main(db) {
	var callback = function(msg, err){
		if(db) db.close();
		console[err ? 'error' : 'log'](msg || 'Finish');
	};
	if(process.argv.length > 2) {
		var split = process.argv[2].split('-');
		if(split.length != 3 || split.some(isNaN))
			return callback('Error: argument must be a date string', true);
		return parseXMLFile(split, callback);
	}
	fs.readdir(dataDir, function(err, dirs) {
		if(err) return console.error('Error: no `data` directory to import');
		parseByYear(dirs, 0, callback);
	});
}

function parseByYear(years, index, callback) {
	if(index == years.length) return setImmediate(callback);
	var next = function(msg, err) {
		if(msg) console[err ? 'error' : 'log'](msg);
		setImmediate(parseByYear, years, index + 1, callback);
	};
	var year = years[index];
	var dir = dataDir + year;
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
	parseXMLFile(split, next);
}

function parseXMLFile(dateArr, next) {
	var dateStr = dateArr.join('-');
	var filename = dataDir + dateArr[0] + '/' + dateStr + '/' + dateStr + '.xml';
	dateArr[0] = parseInt(dateArr[0], 10) + 1911;
	var dateCEStr = (new Date(dateArr.join('-'))).toISOString().substr(0, 10);
	fs.readFile(filename, 'utf8', function(err, xml) {
		if(err) return next('Error: error on reading ' + filename, err);
		xml2js.parseString(xml, function(err, res) {
			if(err) return next('Error: XML parsing error in ' + filename, err);
			var records;
			try {
				records = res.Gazette.Record;
				records.forEach(function(rec) {
					if(deleteHTMLContent) delete rec.HTMLContent;
					for(var i in rec) {
						if(!Array.isArray(rec[i]) || rec[i].length != 1)
							return console.error('Error: uknown format of some record on ' + dateStr);
						var val = rec[i][0];
						if(val) {
							if(arrayFields.indexOf(i) == -1) rec[i] = val;
							else rec[i] = val.split(';');
						}
						else delete rec[i];
					}
					rec.gazetteDate = dateCEStr;
				});
			}
			catch(err) {return next('Error: xmlDoc with wrong structure in' + filename, err);}

			if(outputJSON) fs.writeFileSync(
				filename.slice(0, -3) + 'json',
				JSON.stringify(records, null, '\t').replace(/\n\t+/g, '\n')
			);
			if(coll) coll.insertMany(records, function(err) {
				next('Imported gazette on ' + dateStr, err);
			});
			else next(dateStr);
		});
	});
}
