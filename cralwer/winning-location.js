const puppeteer = require('puppeteer');

const crawler = async () => {
  try {
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

      for (let current = 1; current <= totalPage; current++) {
        await page.goto(`https://lottohell.com/winstores/?page=${current}&round=${round}&rank=1`);
        await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
        await page.waitFor(1000);
        const storeDataArray = await page.evaluate(() => {
          let selection, storeName, address;
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

          $('.card.border-gold').each(async (index, item) => {
            selection = checkSelection(removeBlank($(item).find('.card-header').text()));
            storeName = removeBlank($(item).find('.card-body .text-primary').text());
            address = removeBlank($(item).find('.card-body .card-text').text());

            result.push({
              selection,
              storeName,
              address,
            })
          });

          return result;
        });

        for (const store of storeDataArray) {
           await console.log(store)
        }
      }
    }

    // 2등 당첨 판매점 조회
    for (let round = 947; round >= 262; round--) {
      await page.goto(`https://lottohell.com/winstores/?page=1&round=${round}&rank=2`);
      await page.waitFor(1000);
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

      for (let current = 1; current <= totalPage; current++) {
        await page.goto(`https://lottohell.com/winstores/?page=${current}&round=${round}&rank=2`);
        await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.2.1.min.js' });
        await page.waitFor(2000);
        const storeDataArray = await page.evaluate(() => {
          let storeName, address;
          const result = [];
          const removeBlank = (str) => {
            return str.trim().replace(/ +/g, " ")
          };

          $('.card.border-silver').each(async (index, item) => {
            storeName = removeBlank($(item).find('.card-body .text-primary').text());
            address = removeBlank($(item).find('.card-body .card-text').text());

            result.push({
              storeName,
              address,
            })
          });

          return result;
        });

        for (const store of storeDataArray) {
          await console.log(store)
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



crawler()
