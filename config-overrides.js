module.exports = function override(config, env) {
  console.log('###', { ...config, devtool: 'cheap-module-source-map' })
  // New config, e.g. config.plugins.push...
  return { ...config, devtool: 'cheap-module-source-map' }
}
