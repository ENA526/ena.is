module.exports = {
  apps: [
    {
      name: 'sveltekit',
      script: 'build/index.js',
      exec_mode: 'fork',  // <— not cluster
      instances: 1,       // <— single process per container
      env: {
        NODE_ENV: 'production',
        PORT: '3000',     // must match APP_PORT below
      },
    },
  ],
};
