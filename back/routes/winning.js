const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const IS_CRON_TEST = process.env.CRON_TEST === 'true'; // 크론 테스트인지 여부 확인
const IS_DEV = process.env.NODE_ENV === 'development'; // DEV 환경인지 확인

router.get('/', async (req, res, next) => { // /api/user
  try {
    const browser = await puppeteer.launch({
      headless: true, // 실제 화면에 보여줄지 말지 결정
    });
    const page = await browser.newPage()
    await page.goto('https://m.dhlottery.co.kr/qr.do?method=winQr&v=1029q051620212238q091118263538q051316253044q082021373839q0315172232421752363717')

    const isWinning = await page.evaluate(() => {
      const noticeText = document.getElementsByClassName('bx_notice')[0].innerText

      if (noticeText.indexOf('낙첨') > -1) {
        return false
      } else {
        return true
      }
    })

    await page.close()
    return res.status(200).json({
      success: true,
      isWinning: isWinning
    });
  } catch(e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
