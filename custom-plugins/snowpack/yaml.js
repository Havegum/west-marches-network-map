const fs = require('fs');
const toSource = require('tosource');
const YAML = require('js-yaml');
const makeLegalIdentifier = require('./makeLegalIdentifier.js');

module.exports = function yaml (snowpackConfig, pluginOptions) {
  return {
    name: 'snowpack-plugin-yaml',
    resolve: {
      input: ['.yaml'],
      output: ['.js'],
    },
    async load ({ filePath }) {
      const yamlString = fs.readFileSync(filePath, 'utf-8');
      const data = YAML.safeLoad(yamlString);
      const keys = Object.keys(data).filter(key => key === makeLegalIdentifier(key));

      return {
        '.js': `
          var data = ${toSource(data)};
          export default data;
          ${keys.map(key => `export var ${key} = data.${key};`).join('\n')}
        `
      };
    }
  };
};
