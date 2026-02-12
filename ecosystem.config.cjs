module.exports = {
  apps: [{
    name: 'client-queue-manager',
    script: 'start.mjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '500M',
    restart_delay: 5000,
    max_restarts: 10,
    watch: false,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/client-queue-error.log',
    out_file: './logs/client-queue-out.log',
    merge_logs: true
  }]
};
