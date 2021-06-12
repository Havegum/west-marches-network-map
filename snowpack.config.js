module.exports = {
  mount: {
    public: '/public',
    src: '/',
    'public/dev': '/',
  },
  alias: {
    '@': './src'
  },
  plugins: [
    '@snowpack/plugin-svelte',
    './custom-plugins/snowpack/dsv.js',
    './custom-plugins/snowpack/yaml.js',
    './custom-plugins/snowpack/json-like.js',
  ],

  devOptions: {
    port: 5000
  }
}
