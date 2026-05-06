module.exports = {
    apps: [
      {
        name: "my-next-app",
        script: "npm",
        args: "start",
        cwd:"/www/wwwroot/tianciyinji",
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };