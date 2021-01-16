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
  '서울',
  '경기',
  '부산',
  '대구',
  '인천',
  '대전',
  '울산',
  '강원',
  '충북',
  '충남',
  '광주',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
  '세종',
];

const getLottoData = async () => {
  for (const SIDO2 of SIDOArray) {
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

      for (const store of storeDataArray) {
        const {
          // BPLCDORODTLADRES, // 도로명 전체 주소
          BPLCLOCPLCDTLADRES, // 지번 주소
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

        parseInt(DEAL645) === 1 ? isClosedStore = false : isClosedStore = true;
        if (isClosedStore) break;

        const storetype = await checkStoreType(FIRMNM, BPLCLOCPLCDTLADRES);
        const address = `${BPLCLOCPLC1} ${BPLCLOCPLC2} ${BPLCLOCPLC3? BPLCLOCPLC3: ''} ${BPLCLOCPLCDTLADRES}`;

        const resultStoreData = {
          address,
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

      }

      isClosedStore = false;
      currentPage++;
    }
  }
};
getLottoData();



// 로또 당첨지점의 Type 파악.
const checkStoreType = (storeName, lastAddress) => {
  lastAddress = lastAddress ? lastAddress : '';
  if ( storeName.indexOf('CU') > -1
    || storeName.indexOf('cu') > -1
    || storeName.indexOf('씨유') > -1
    || lastAddress.indexOf('CU') > -1
    || lastAddress.indexOf('cu') > -1
    || lastAddress.indexOf('씨유') > -1) {
    return 1;
  }

  if (storeName.indexOf('GS') > -1
    || storeName.indexOf('gs') > -1
    || storeName.indexOf('지에스') > -1
    || lastAddress.indexOf('GS') > -1
    || lastAddress.indexOf('gs') > -1
    || lastAddress.indexOf('지에스') > -1
  ) {
    return 2;
  }

  return 0;
};

const checkStoreExist = async(storeData) => {
  try {
    const store = await db.Store.findOne({
      where: { donghangid: storeData.donghangid },
      attributes: ['id'],
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




