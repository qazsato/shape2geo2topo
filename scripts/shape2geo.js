const fs = require('fs');
const JSONStream = require('JSONStream');
const es = require('event-stream');

let prevPrefCode = null;
let prevAddrCode = null;
let prevFeatures = [];

// MEMO ファイルが500MB越えのためstreamで順次処理をします。
fs.createReadStream('./datas/source/output.geojson')
  .pipe(JSONStream.parse('features.*'))
  .pipe(es.mapSync((feature) => {
    // 住所コード不定のものは対象外とします。
    if (feature.properties.N03_007) {
      const prefCode = getPrefectureCode(feature);
      // ディレクトリ作成
      if (!fs.existsSync(`./datas/geojson/${prefCode}`)) {
        fs.mkdirSync(`./datas/geojson/${prefCode}`);
      }
      const addrCode = getAddressCode(feature);
      const names = getAddressNames(feature);
      const name = names[2] ? names[1] + names[2] : names[1];
      if (prevAddrCode && addrCode !== prevAddrCode) {
        writeFile();
        prevFeatures = []; // 初期化
      }
      prevPrefCode = prefCode;
      prevAddrCode = addrCode;
      prevFeatures.push(feature);
    }
  }))
  .on('end', () => {
    writeFile();
    console.log('shape to geojson complete.');
  });

/**
 * 都道府県コードを取得します。
 * @param {*} feature 
 */
function getPrefectureCode(feature) {
  return feature.properties.N03_007.substring(0, 2);
}

/**
 * 住所コード(行政区域コード)を取得します。
 * @param {*} feature 
 */
function getAddressCode(feature) {
  return feature.properties.N03_007;  // 行政区域コード
}

/**
 * 住所名称を取得します。
 * @param {*} feature 
 */
function getAddressNames(feature) {
  const names = []
  const pref  = feature.properties.N03_001;   // 都道府県名
  const city1 = feature.properties.N03_002;   // 支庁・振興局名
  const city2 = feature.properties.N03_003;   // 郡・政令都市名
  const city3 = feature.properties.N03_004;   // 市区町村名

  names.push(pref);
  if (city1 && city1 !== '北海道') {
    names.push(city1);
  }
  if (city2) {
    names.push(city2);
  }
  if (city3) {
    names.push(city3);
  }
  return names;
}

function writeFile() {
  const json = {
    'type': 'FeatureCollection',
    'features': prevFeatures
  };
  fs.writeFileSync(`./datas/geojson/${prevPrefCode}/${prevAddrCode}.geojson`, JSON.stringify(json));
}