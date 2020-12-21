module.exports = {
  apps: [
    {
      name: "coli-rich",
      script: "./server.js",
      node_args: "--es-module-specifier-resolution=node",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
