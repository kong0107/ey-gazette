# ey-gazette
下載行政院公報

## Data Source
資料網址格式： `http://gazette.nat.gov.tw/egFront/OpenData/download.jsp?fn=<fn>`

[行政院公報資訊網](http://gazette.nat.gov.tw/egFront/OpenData/help.jsp)寫到：

> ## 本月資料
> 提供最新一個月已出刊之公報壓縮檔，一天一個壓縮檔，…

`<fn>` 格式為 `%03d-%02d-%02d` 。

> ## 歷史資料
> 提供行政院公報自民國94年度起各年度每月所出刊之公報壓縮檔，…
> 此處壓縮檔非只含一天的公報，…
> 各壓縮檔只包含該月份幾個出刊日的公報，依此類推，因此各月份都會有數量不等的壓縮檔，…

`<fn>` 格式為 `%03d-%02d_%d` ，最後一個數字並不補零，且其前是底線而非引號。

## Usage
以下不需要都做，視需求而定。

### 下載原始資料
僅需 `main.sh` 。
* 如僅需下載一份，執行 `./main.sh <fn>` 。
* 如需下載全部，則執行 `./main.sh` ，可能需時十幾個小時，解壓縮後的資料達 20 GB 以上。

### 將下載來的 XML 轉換為 JSON 或匯入 MongoDB
* 編輯 `import2mongo.js` ，設定 `dburl` 與 `outputJSON` 。
* 執行 `npm install && node import2mongo` 。
