const fs = require('fs');
const JSONStream = require('JSONStream');
const es = require('event-stream');

let prefCode = null;  // 都道府県コード(2桁)
let addrCode = null;  // 市区町村コード(5桁)
let features = [];    // 市区町村毎の形状データ

// 全国の場合ファイルサイズが500MBを越えるのためstreamで順次処理をする
fs.createReadStream('./datas/source/output.geojson')
  .pipe(JSONStream.parse('features.*'))
  .pipe(es.mapSync((feature) => {
    if (!feature.properties.N03_007) return;  // 住所コード不定のものは対象外とする
    const pc = getPrefectureCode(feature);
    const ac = getAddressCode(feature);
    const names = getAddressNames(feature);
    const name = names[2] ? names[1] + names[2] : names[1];
    makePrefDir(pc);
    if (addrCode && addrCode !== ac) {
      writeCityFile();
      features = []; // 初期化
    }
    prefCode = pc;
    addrCode = ac;
    feature.properties = {}; // ファイルサイズ軽量化のため空にする
    features.push(feature);
  }))
  .on('end', () => {
    writeCityFile();
    console.log('Convert shape to geojson is complete.');
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

function makePrefDir(prefCode) {
  if (fs.existsSync(`./datas/geojson/${prefCode}`)) return;
  fs.mkdirSync(`./datas/geojson/${prefCode}`);
}

function writeCityFile() {
  const json = {
    'type': 'FeatureCollection',
    'features': features
  };
  fs.writeFileSync(`./datas/geojson/${prefCode}/${addrCode}.geojson`, JSON.stringify(json));
}