const axios = require('axios');
const qs = require('qs');
const path = require('path');
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
dotenv.config({
  path: path.resolve(
    process.env.NODE_ENV == "production" ? ".env.prod" : ".env.dev"
  ),
});

const db = require('./models/index');

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

const insertStore = async () => {
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
          BPLCDORODTLADRES, // 도로명 전체 주소
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
        const address = `${BPLCLOCPLC1} ${BPLCLOCPLC2} ${BPLCLOCPLC3} ${BPLCLOCPLCDTLADRES}`.replace(/ +/g, " "); // 공백 1개로
        const { region3, region4 } = await getRegion3to4(address);
        const address_new = BPLCDORODTLADRES.replace(/ +/g, " ").trim();
        const { region3_new, region4_new } = await getRegionNew3to4(address_new);
        const region5 = await getEndWord(address);
        const region5_new = await getEndWord(address_new);

        const resultStoreData = {
          address,
          address_new,
          name: FIRMNM,
          phone: RTLRSTRTELNO,
          region1: BPLCLOCPLC1,
          region2: BPLCLOCPLC2,
          region3,
          region3_new,
          region4,
          region4_new,
          region5,
          region5_new,
          donghangid: RTLRID,
          latitude: LATITUDE,
          longitude: LONGITUDE,
          storetype,
          opened: true,
        };

        try {
          const isStoreExist = await checkStoreExist(resultStoreData);
          if (!isStoreExist) {
            console.log('새로운 판매점 데이터 삽입');
            await db.Store.create(resultStoreData);
          }
          else {
            console.log('해당 판매점 데이터 이미 존재');
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

/**
 * 구 주소의 resion3와 region4를 구함.
 * @param address: 구 주소
 * @returns {{region3: string, region4: string}} : 분리된 구 주소 반환
 */
const getRegion3to4 = (address) => {
  const address_words = address.trim().split(' ');

  if (isTwoWordsRegion2(address)) {
    return {
      region3: address_words[3],
      region4: address_words[4],
    }
  }

  return {
    region3: address_words[2],
    region4: address_words[3],
  }
};

/**
 * 신 주소의 region3와 resion4를 구함.
 * @param address_new: 신 주소
 * @returns {{region3_new: string, region4_new: string}} : 분리된 신 주소 반환.
 */
const getRegionNew3to4 = (address_new) => {
  const address_words = address_new.trim().split(' ');

  if (isTwoWordsRegion2(address_new)) {
    return {
      region3_new: address_words[3],
      region4_new: address_words[4],
    }
  }

  return {
    region3_new: address_words[2],
    region4_new: address_words[3],
  }
};

/**
 * 구 주소에서 region2가 2개 이상의 단어인지를 체크함.
 * @param address: 구 주소
 * @returns {boolean} : resion2가 2개 이상의 단어인지 여부
 */
const isTwoWordsRegion2 = (address) => {
  if (
    address.indexOf('고양시 덕양구') > -1 ||
    address.indexOf('고양시 일산동구') > -1 ||
    address.indexOf('고양시 일산서구') > -1 ||
    address.indexOf('성남시 분당구') > -1 ||
    address.indexOf('성남시 수정구') > -1 ||
    address.indexOf('성남시 중원구') > -1 ||
    address.indexOf('수원시 권선구') > -1 ||
    address.indexOf('수원시 영통구') > -1 ||
    address.indexOf('수원시 장안구') > -1 ||
    address.indexOf('수원시 팔달구') > -1 ||
    address.indexOf('안산시 단원구') > -1 ||
    address.indexOf('안산시 상록구') > -1 ||
    address.indexOf('안양시 동안구') > -1 ||
    address.indexOf('안양시 만안구') > -1 ||
    address.indexOf('용인시 기흥구') > -1 ||
    address.indexOf('용인시 수지구') > -1 ||
    address.indexOf('용인시 처인구') > -1 ||
    address.indexOf('청주시 상당구') > -1 ||
    address.indexOf('청주시 서원구') > -1 ||
    address.indexOf('청주시 청원구') > -1 ||
    address.indexOf('청주시 흥덕구') > -1 ||
    address.indexOf('천안시 동남구') > -1 ||
    address.indexOf('천안시 서북구') > -1 ||
    address.indexOf('전주시 덕진구') > -1 ||
    address.indexOf('전주시 완산구') > -1 ||
    address.indexOf('포항시 남구') > -1 ||
    address.indexOf('포항시 북구') > -1 ||
    address.indexOf('창원시 마산합포구') > -1 ||
    address.indexOf('창원시 마산회원구') > -1 ||
    address.indexOf('창원시 성산구') > -1 ||
    address.indexOf('창원시 의창구') > -1 ||
    address.indexOf('창원시 진해구') > -1
  ) {
    return true;
  }

  return false;
};

/**
 * 문장의 마지막 단어 추출.
 * @param sentence: 문장
 * @returns {*|string}: 마지막 단어
 */
const getEndWord = (sentence) => {
  const words = sentence.split(' ');
  return words[words.length -1];
};

/**
 * 공백을 체크하고 공백이 있으면 true 없으면 false 반환.
 * @param str: string 문자
 * @returns {boolean}: 공백 여부
 */
const checkSpace = (str) => {
  if (str.indexOf(' ') !== -1) {
    return true;
  } else {
    return false;
  }
};

/**
 * 로또 당첨지점의 Type 파악.
 * @param storeName: 로또 판매점 이름
 * @param lastAddress: 로또 판매점의 마지막 주소
 * @returns {string}: Type (CU, GS, 일반)
 */
const checkStoreType = (storeName, lastAddress) => {
  lastAddress = lastAddress ? lastAddress : '';
  if (storeName.indexOf('CU') > -1
    || storeName.indexOf('cu') > -1
    || storeName.indexOf('씨유') > -1
    || lastAddress.indexOf('CU') > -1
    || lastAddress.indexOf('cu') > -1
    || lastAddress.indexOf('씨유') > -1) {
    return 'CU';
  }

  if (storeName.indexOf('GS') > -1
    || storeName.indexOf('gs') > -1
    || storeName.indexOf('지에스') > -1
    || lastAddress.indexOf('GS') > -1
    || lastAddress.indexOf('gs') > -1
    || lastAddress.indexOf('지에스') > -1
  ) {
    return 'GS';
  }

  return '일반';
};

/**
 * 로또 판매점이 이미 DB 저장되었는지 여부 파악.
 * @param storeData: Axios로 얻어온 store 객체 (donhangid 파싱)
 * @returns {boolean}: DB 저장 여부
 */
const checkStoreExist = async (storeData) => {
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

/**
 * 불필요한 문자열 제거후 JSON Object로 반환.
 * EUC-KR의 특수문자 왼쪽괄호[ ( ]  오른쪽괄호[ ) ] 를 UTF-8의 괄호로 처리.
 * @param data: 바이트 ArrayBuffer
 * @returns {any}: 왼쪽괄호와 오른쪽 괄호가 치환된 ArrayBuffer를 이용하여 JSON생성 후 반환
 */
const toJson = (data) => {
  return JSON.parse(
    data
      .replace(/\&\&\#35\;40\;/gi, '(')
      .replace(/\&\&\#35\;41\;/gi, ')')
      .replace(/\&amp\;/gi, '&')
  )
};

// insertStore();

module.exports.crawl = insertStore;
