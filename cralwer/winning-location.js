const puppeteer = require('puppeteer');
const db = require('./models');
const dotenv = require('dotenv');
dotenv.config();

const crawler = async () => {
  try {
    await db.sequelize.sync();

    const browser = await puppeteer.launch({
      headless: false,
      // args: ['--window-size=1920, 1080', '--disable-notifications', '--no-sandbox']
    });

    const page = await browser.newPage();
    // page.on("console", (consoleObj) => console.log(consoleObj.text()));
    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
    await page.setViewport({
      width: 1080,
      height: 1080,
    });

    // 1등 당첨 판매점 조회
    for (let round = 949; round >= 262; round--) {
      await page.goto(`https://lottohell.com/winstores/?page=1&round=${round}&rank=1`);
      await page.waitFor(1000);

      // 전체 페이지 갯수를 얻어옴.
      const totalPage = await page.evaluate(() => {
        const getTotalPage = (str) => {
          const removeBlankStr = str.replace(/ +/g, "");
          if (!removeBlankStr) {
            return -1
          }

          return parseInt(removeBlankStr.substr(removeBlankStr.indexOf('/') + 1, 1), 10);
        };
        return getTotalPage($('.current').text().trim());
      });

      // 페이지 단위로 순회
      for (let current = 1; current <= totalPage; current++) {
        await page.goto(`https://lottohell.com/winstores/?page=${current}&round=${round}&rank=1`);
        await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
        await page.waitFor(1000);
        const winningDataArray = await page.evaluate(() => {
          let selection, storeName, address;
          const rank = 1;
          const result = [];
          const removeBlank = (str) => {
            return str.trim().replace(/ +/g, " ")
          };
          const checkSelection = (str) => {
            try {
              const leftBraceIndex = str.indexOf('(');
              const rightBraceIndex = str.indexOf(')');
              return str.substring(leftBraceIndex + 1, rightBraceIndex);
            } catch (e) {
              return e;
            }
          };

          for (const item of $('.card.border-gold')) {
            selection = checkSelection(removeBlank($(item).find('.card-header').text()));
            storeName = removeBlank($(item).find('.card-body .text-primary').text());
            address = removeBlank($(item).find('.card-body .card-text').text());

            result.push({
              rank,
              selection,
              storeName,
              address,
            })
          }

          return result;
        });

        // 1. 현재 당첨판매점 리스트에 데이터가 존재하는지 체크
        // 2. 존재하지 않는다면 store DB에서 해당 로또 판매점 정보가 있는지 체크
        for (const winning of winningDataArray) {
          winning.round = round;
          await insertWinning(winning);
          await console.log(winning)
        }
      }
    }

    // 2등 당첨 판매점 조회
    for (let round = 949; round >= 262; round--) {
      await page.goto(`https://lottohell.com/winstores/?page=1&round=${round}&rank=2`);
      await page.waitFor(1000);

      // 전체 페이지 갯수를 얻어옴.
      const totalPage = await page.evaluate(() => {
        const getTotalPage = (str) => {
          const removeBlankStr = str.replace(/ +/g, "");
          if (!removeBlankStr) {
            return -1
          }
          return parseInt(removeBlankStr.substr(removeBlankStr.indexOf('/') + 1, 1), 10);
        };
        return getTotalPage($('.current').text().trim());
      });

      // 페이지 단위로 순회
      for (let current = 1; current <= totalPage; current++) {
        await page.goto(`https://lottohell.com/winstores/?page=${current}&round=${round}&rank=2`);
        await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
        await page.waitFor(1000);
        const winningDataArray = await page.evaluate(() => {
          let storeName, address, selection = null;
          const rank = 2;
          const result = [];
          const removeBlank = (str) => {
            return str.trim().replace(/ +/g, " ")
          };

          for (const item of $('.card.border-silver')) {
            storeName = removeBlank($(item).find('.card-body .text-primary').text());
            address = removeBlank($(item).find('.card-body .card-text').text());

            result.push({
              rank,
              selection,
              storeName,
              address,
            })
          }

          return result;
        });

        for (const winning of winningDataArray) {
          winning.round = round;
          await insertWinning(winning);
          await console.log(winning)
        }
      }
    }

    console.log(`크롤러 작업 완료`);
    await page.close();
    await browser.close();
  } catch (e) {
    console.error(e);
  }
};

// 주소를 파싱해서 region에 대한 데이터를 얻어온다.
// 만약 region2에 2단어 이상의 주소가 포함되 있을때의 예외처리를 진행한다.
const devideRegion = (address) => {
  const address_words = address.split(' ');

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
    return {
      region1: address_words[0],
      region2: address_words[1] + " " + address_words[2],
      region3: address_words[3],
      region4: address_words[4],
      region5: address_words[address_words.length -1],
    }
  }

  return {
    region1: address_words[0],
    region2: address_words[1],
    region3: address_words[2],
    region4: address_words[3],
    region5: address_words[address_words.length -1],
  }
};

const insertWinning = async (winning) => {
  // store DB에 해당 판매점
  const { rank, round, selection, storeName, address } = winning;
  let { region1, region2, region3, region4, region5 } = await devideRegion(address.replace(/ +/g, " ").trim());
  if (!region4) region4 = '값없음';

  const makeWinning = async (rank, selection, round) => {
    const winning = await db.Winning.create({
      rank,
      selection,
      round,
    });
    return winning;
  };


  let stores = null;

  if (!region2) { // 가끔 주소가 한단어일때 에러 예외처리
    await makeWinning(rank, selection, round);
    return null;
  } else if (region1 === '세종') { // 세종시일때는 region1과 storeName만 비교
    stores = await db.Store.findAll({
      where: {
        name: storeName,
        region1,
      }
    });
  } else {
    stores = await db.Store.findAll({
      where: {
        name: storeName,
        region1,
        region2,
      }
    });
  }

  if (stores.length === 0) {
    await makeWinning(rank, selection, round);
    console.log('입력 성공 : 판매점 존재 X');
    return null;
  }

  if (stores.length === 1) {
    const newWinning = await makeWinning(rank, selection, round);
    await stores[0].addWinning(newWinning.id);
    console.log('입력 성공 : 판매점 존재 O (name)');
    return null;
  }

  // region3를 비교후 0,1개일때 값입력, 2개이상일때 region5 비교
  const region3Stores = stores.filter((store) => store.region3 === region3 || store.region3_new === region3);

  if (region3Stores.length === 0) {
    await makeWinning(rank, selection, round);
    console.log('입력 성공 : 판매점 존재 X (region3)');
    return null;
  }

  if (region3Stores.length === 1) {
    const newWinning = await makeWinning(rank, selection, round);
    await region3Stores[0].addWinning(newWinning.id);
    console.log('입력 성공 : 판매점 존재 O (region3)');
    return null;
  }

  // region3를 비교후 0,1개일때 값입력, 2개이상일때 region5 비교
  const region4Stores = stores.filter((store) => store.region4 === region4 || store.region4_new === region4);

  if (region4Stores.length === 0) {
    await makeWinning(rank, selection, round);
    console.log('입력 성공 : 판매점 존재 X (region4)');
    return null;
  }

  if (region4Stores.length === 1) {
    const newWinning = await makeWinning(rank, selection, round);
    await region4Stores[0].addWinning(newWinning.id);
    console.log('입력 성공 : 판매점 존재 O (region4)');
    return null;
  }

  // region5를 비교후 0,1개일때 값입력, 2개 이상일때 => 크롤러 멈춤
  const region5Stores = region3Stores.filter((store) => store.region5 === region5 || store.region5_new === region5);

  if (region5Stores.length === 0) {
    await makeWinning(rank, selection, round);
    console.log('입력 성공 : 판매점 존재 X (region5)');
    return null;
  }

  if (region5Stores.length === 1) {
    const newWinning = await makeWinning(rank, selection, round);
    await region5Stores[0].addWinning(newWinning.id);
    console.log('입력 성공 : 판매점 존재 O (region5)');
    return null;
  }

  if (region5Stores.length >= 2) {
    for (const store of region5Stores) {
      await makeWinning(rank, selection + "에러", round);
      console.log('입력 성공 : 판매점 존재 X (에러 + region5)');
    }
    return null;
  }
};

crawler();
