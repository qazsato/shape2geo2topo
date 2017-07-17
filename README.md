# shape2geo2topo

## About

国土交通省が提供している[行政区域データ](http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03.html)を市区町村単位の、 **GeoJSON** と **TopoJSON** ファイルに変換するコンバーターです。

下記のような形状データが出力されます。

- ex. 東京都千代田区の形状データ
  - [GeoJSON](https://gist.github.com/qazsato/a4e37fe13dbd93c61b39b6be9e416131)
  - [TopoJSON](https://gist.github.com/qazsato/c3db50195a30fbde4ebd186818040162)

## How to use

1. [行政区域データ](http://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03.html)にアクセスし **全国** データをDLします。
2. 下記コマンドを実行します。

        $ git clone https://github.com/qazsato/shape2geo2topo.git
        $ cd shape2geo2topo
        $ npm install

3. 1.でDLしたzipファイルを解凍し、中身を **shape2geo2topo/datas/source/** 配下にコピーします。
4. .shpファイルをGeoJSONに変換するため下記コマンドを実行します。

        $ npm run shape2geo

5. .geojsonファイルをTopoJSONに変換するため下記コマンドを実行します。

        $ npm run geo2topo

6. **shape2geo2topo/datas/** 配下に **geojson** と **topojson** フォルダが作成されていれば市区町村データ作成完了です。