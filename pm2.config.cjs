// @ts-check

/** @type {import("pm2").StartOptions} */
module.exports = {
  source_map_support: false,
  name: 'wpm-discord-bot',
  script: 'dist/main.js',
  interpreter: 'bun'
};
