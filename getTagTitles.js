/**
 * 抓取行政院公報的 XML 欄位說明
 *
 * 用法：
 * 1. 用瀏覽器開啟 http://gazette.nat.gov.tw/egFront/OpenData/help.jsp 。
 * 2. 在主控台執行本頁程式碼。
 */
var result = {};
Array.prototype.forEach.call(
	document.querySelector('.table02').querySelectorAll('tr'),
	function(row, index) {
		if(!index) return;
		var cols = row.children;
		result[cols[0].textContent.trim()] = cols[1].textContent.trim();
	}
);
JSON.stringify(result, null, '\t');
