const {CronJob} = require('cron');

const insertStore = require('./insertStore');
const deleteClosedStore = require('./deleteClosedStore');
const insertStoreWinning = require('./insertStoreWinning');

const insertStoreService = new CronJob({
  cronTime: '0 0 * * 0', // 매주 일요일 00시 00분
  onTick: insertStore.crawl,
  timeZone: "Asia/Seoul"
});

insertStoreService.start();


const deleteClosedStoreService = new CronJob({
  cronTime: '5 0 * * 0', // 매주 일요일 00시 5분
  onTick: deleteClosedStore.crawl,
  timeZone: "Asia/Seoul"
});

deleteClosedStoreService.start();

const insertStoreWinningService = new CronJob({
  cronTime: '10 0 * * 0', // 매주 일요일 00시 10분
  onTick: async () => {
    await insertStoreWinning.crawl(true)
  },
  timeZone: "Asia/Seoul"
});

insertStoreWinningService.start();
