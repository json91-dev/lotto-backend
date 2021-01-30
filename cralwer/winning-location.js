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
    page.on("console", (consoleObj) => console.log(consoleObj.text()));


    await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
    await page.setViewport({
      width: 1080,
      height: 1080,
    });

    // 1등 당첨 판매점 조회
    for (let round = 947; round >= 262; round--) {
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
          let selection, storeName, address_new;
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
            address_new = removeBlank($(item).find('.card-body .card-text').text());

            result.push({
              rank,
              selection,
              storeName,
              address_new,
            })
          }

          return result;
        });


        console.log(winningDataArray);

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
    for (let round = 947; round >= 262; round--) {
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
          let storeName, address_new, selection = null;
          const rank = 2;
          const result = [];
          const removeBlank = (str) => {
            return str.trim().replace(/ +/g, " ")
          };

          for (const item of $('.card.border-silver')) {
            storeName = removeBlank($(item).find('.card-body .text-primary').text());
            address_new = removeBlank($(item).find('.card-body .card-text').text());

            result.push({
              rank,
              selection,
              storeName,
              address_new,
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

const insertWinning = async (winning) => {
  // store DB에 해당 판매점
  console.log('당첨판매점 입력시작');
  const { rank, round, selection, storeName, address_new } = winning;

  const store = await db.Store.findOne({
    where: db.sequelize.and(
      { name: storeName },
      db.sequelize.or(
        { address: address_new },
        { address_new: address_new }
      ))
  });

  if (!store) {
    console.log('로또판매점이 존재하지 않습니다.');
    return null;
  }

  const newWinning = await db.Winning.create({
    rank,
    selection,
    round,
  });

  await store.addWinning(newWinning.id);
  console.log('당첨판매점 데이터 입력 성공~');
};


crawler();
