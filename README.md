## Find Contributor with React
![Screenshot](https://github.com/syi0808/FCB/blob/main/screenshot.png?raw=true)

### How to use
(Alt or Option) + Space = toggle tooltip
#### When turn on tooltip
You can scroll through the tooltip while the Shift key is pressed.

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

### Plugin Options
#### enabled
This option is an option to indicate the activation status.
If enabled is false, this plugin is not executed.
```js
/** @type {import('next').NextConfig} */
const FCBPlugin = require("fcb-webpack-plugin");

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.plugins.push(new FCBPlugin({ enabled: false }));
    return config;
  }
};

module.exports = nextConfig;
```