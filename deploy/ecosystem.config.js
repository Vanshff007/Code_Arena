// PM2 process definition for the server. Run from the repo root:
//   pm2 start deploy/ecosystem.config.js
//
// instances: 1 / exec_mode: 'fork' is not the default choice, it's a
// requirement - matchmaking queue and battle room state live in the Node
// process's memory (server/features/battles/state.js), not in Mongo or Redis.
// Cluster mode or multiple instances would silently split traffic across
// processes with different in-memory state, breaking matches unpredictably
// rather than throwing an obvious error.
module.exports = {
  apps: [
    {
      name: 'codearena-server',
      cwd: './server',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '500M',
      out_file: '../logs/pm2-out.log',
      error_file: '../logs/pm2-error.log',
      time: true,
    },
  ],
};
