const commonPlugins = [
  require('tailwindcss'),
  require('autoprefixer'),
];

const onlyProductionPlugins = [
  require('autoprefixer'),
];

module.exports = {
  plugins: process.env.NODE_ENV === 'production' ? [...commonPlugins, ...onlyProductionPlugins] : commonPlugins,
};
