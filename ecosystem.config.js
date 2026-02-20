module.exports = {
  apps: [
    {
      name: "home-stock",
      script: "node_modules/.bin/next",
      args: "start",
      instances: "max",
      exec_mode: "cluster",
      cwd: "/var/www/home-stock",
      env: {
        NODE_ENV: "production",
        PORT: 3002,
      },
      max_memory_restart: "512M",
      error_file: "/var/log/pm2/home-stock-error.log",
      out_file: "/var/log/pm2/home-stock-out.log",
      time: true,
    },
  ],
};
