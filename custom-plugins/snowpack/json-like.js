const fs = require('fs');
const toSource = require('tosource');

module.exports = function yaml (snowpackConfig, pluginOptions) {
  return {
    name: 'snowpack-plugin-json-like',
    resolve: {
      input: ['.topojson', '.geojson'],
      output: ['.js'],
    },
    async load ({ filePath, fileExt }) {
      const json = fs.readFileSync(filePath, 'utf-8');

      try {
        const parsed = JSON.parse(json);
        return {
          '.js': `export default ${toSource(parsed)};`
        };

      } catch (err) {
        const message = 'Could not parse JSON file';
        const position = parseInt(/[\d]/.exec(err.message)[0], 10);
        console.error(message, position, id);
        return null;
      }
    }
  };
};
