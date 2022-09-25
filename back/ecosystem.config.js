/**
 * start ecosystem.config.js --env production
 * start ecosystem.config.js --env development
 * 각각의 상태일때 NODE_ENV를 설정한다.
 * 추후 dotenv를 통한 환경변수를 주입할때 사용됨.
 */
module.exports = {
  apps: [{
    name: 'lotto-backend',
    script: './index.js',
    instances: 0,
    exec_mode: 'cluster',
    wait_ready: true,
    listen_timeout: 50000,
    kill_timeout: 5000,
    merge_logs: true,
    env_development: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }],
};
