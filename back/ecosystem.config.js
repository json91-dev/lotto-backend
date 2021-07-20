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
    env: {
      NODE_ENV: "development"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }],
};
