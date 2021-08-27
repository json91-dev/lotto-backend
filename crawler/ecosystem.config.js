module.exports = {
  apps: [{
    name: 'lotto-crawler',
    script: './cronService.js',
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
