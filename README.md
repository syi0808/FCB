## Find Contributor with React

### How to use
Alt + Space or Option + Space = toggle tooltip
#### When turn on tooltip
You can scroll through the tooltip while the Ctrl key is pressed.

### Get Setup
```shell
npm install fcb-webpack-plugin
```
or
```shell
yarn add fcb-webpack-plugin
```
#### In NextJS
Paste in ```next.config.js```
```js
/** @type {import('next').NextConfig} */
const FCBPlugin = require("fcb-webpack-plugin");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.plugins.push(new FCBPlugin());
    return config;
  }
};

module.exports = nextConfig;
```