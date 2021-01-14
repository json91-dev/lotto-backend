const axios = require('axios');
const qs = require('qs');
var Iconv = require('iconv').Iconv;
var iconv = new Iconv('EUC-KR', 'UTF-8//TRANSLIT//IGNORE');
const url = `https://dhlottery.co.kr/store.do?method=sellerInfo645Result`;
const headers = {
  'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8;',
};
const options = {
  headers: headers,
  responseType: 'arraybuffer',
  responseEncoding: 'binary'
};

const dotenv = require('dotenv');
dotenv.config();

const db = require('./models');

const SIDOArray = [
  // '서울',
  // '경기',
  // '부산',
  // '대구',
  // '인천',
  // '대전',
  // '울산',
  // '강원',
  // '충북',
  // '충남',
  // '광주',
  // '전북',
  // '전남',
  // '경북',
  // '경남',
  '제주',
  // '세종',
];

SIDOArray.forEach(async (SIDO2) => {
  await db.sequelize.sync();

  let currentPage = 1;
  let endPage = 100;
  let isClosedStore = false;
  while (currentPage < endPage && !isClosedStore) {
    const param = qs.stringify({
      searchType: 3,
      nowPage: currentPage,
      sltSIDO2: SIDO2,
      sltGUGUN2: '',
    });
    const response = await axios.post(url, param, options);
    const { data } = response;
    const result = toJson(iconv.convert(data).toString());
    const { arr, totalPage } = result;
    const storeDataArray = arr;
    endPage = totalPage;

    storeDataArray.forEach(async (store) => {
        const {
          BPLCDORODTLADRES,
          FIRMNM,
          RTLRSTRTELNO,
          BPLCLOCPLC1,
          BPLCLOCPLC2,
          BPLCLOCPLC3,
          RTLRID,
          LATITUDE,
          LONGITUDE,
          DEAL645
        } = store;

        const storetype = checkStoreType(FIRMNM);

        const resultStoreData = {
          address: BPLCDORODTLADRES,
          name: FIRMNM,
          phone: RTLRSTRTELNO,
          region1: BPLCLOCPLC1,
          region2: BPLCLOCPLC2,
          region3: BPLCLOCPLC3,
          donghangid: RTLRID,
          latitude: LATITUDE,
          longitude: LONGITUDE,
          storetype,
        };
        // console.log(resultStoreData);

        try {
          const isStoreExist = await checkStoreExist(resultStoreData);
          if (!isStoreExist) {
            console.log('데이터 삽입');
            await db.Store.create(resultStoreData)
          }
          else {
            console.log('데이터 이미 존재');
          }
        } catch (e) {
          console.log(e)
        }


        parseInt(DEAL645) === 1 ? isClosedStore = false : isClosedStore = true;
        // console.log(BPLCDORODTLADRES);
      }
    );

    // TODO: foreach문이 끝나기도전에 다음 currentPage ++가 수행됨.
    // 따라서 다음페이지의 수행은 isClosedStore을 기다리지 않고 넘어가기 때문에 모든 데이터를 다 가져오게 됨.
    // For ...of 문으로 변경 필요

    currentPage++;
  }
})
;

// 로또 당첨지점의 Type 파악.
const checkStoreType = (storeName) => {
  if (storeName.indexOf('CU') > -1 || storeName.indexOf('cu') > -1) {
    return 1;
  }

  if (storeName.indexOf('GS') > -1 || storeName.indexOf('gs') > -1) {
    return 2;
  }

  return 0;
};

const checkStoreExist = async (storeData) => {
  try {
    const store = await db.Store.findOne({
      where: { donghangid: storeData.donghangid },
      attributes: [ 'id' ],
    });
    return !!(store && store.id)
  } catch (e) {
    console.log(e);
    return null;
  }
};

// 불필요한 문자열 제거후 JSON Object로 반환.
// EUC-KR의 특수문자 왼쪽괄호 오른쪽괄호를 UTF-8의 괄호로 처리.
const toJson = (data) => {
  return JSON.parse(
    data.replace(/\&\&\#35\;40\;/gi, '(').replace(/\&\&\#35\;41\;/gi, ')')
  )
};




