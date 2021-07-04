const crawlerStore = require('cralwer/storeInsert');
const crawlerWinning = require('cralwer/storeWinningInsert');

const storeCron = new CronJob({
  cronTime: '0 0 * * 7', // 매주 일요일 00시 00분
  onTick: crawlerStore(),
  timeZone: "Asia/Seoul"
});

storeCron.start();

const winningCron = new CronJob({
  cronTime: '10 0 * * 7', // 매주 일요일 00시 10분
  onTick: crawlerWinning(true),
  timeZone: "Asia/Seoul"
});

winningCron.start();
