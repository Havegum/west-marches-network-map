const fs = require('fs');
const toSource = require('tosource');
const { csvParse, tsvParse } = require('d3-dsv');

const parsers = { '.csv': csvParse, '.tsv': tsvParse };

module.exports = function yaml (snowpackConfig, pluginOptions) {
  return {
    name: 'snowpack-plugin-dsv',
    resolve: {
      input: ['.csv', '.tsv'],
      output: ['.js'],
    },
    async load ({ filePath, fileExt }) {
      const dsvString = fs.readFileSync(filePath, 'utf-8');
      let rows = parsers[fileExt](dsvString);

      if (pluginOptions && typeof pluginOptions.processRow === 'function') {
        rows = rows.map(pluginOptions.processRow);
      }

      return { '.js': `export default ${toSource(rows)};` };
    }
  };
};
