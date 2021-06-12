import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';

import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import svelte from 'rollup-plugin-svelte';
import alias from '@rollup/plugin-alias';
import strip from '@rollup/plugin-strip';
import serve from 'rollup-plugin-serve';
import babel from 'rollup-plugin-babel';
import yaml from '@rollup/plugin-yaml';
import copy from 'rollup-plugin-copy';
import dsv from '@rollup/plugin-dsv';

import json from './custom-plugins/rollup/json.js'; // Custom plugin for .topo- and .geojson support

const production = !process.env.ROLLUP_WATCH;

const postcssPlugins = [
	postcssPresetEnv({
		autoprefixer: { grid: true },
		browsers: 'last 2 versions',
		stage: 0,
	}),
	autoprefixer(),
	// TODO: remove unused css variables with 2 passes of regex.
	// TODO: dynamically create @font-face rules with postcss-font-magician and custom foundry

	// PostCSS plugin creation guide here:
	// https://github.com/postcss/postcss/blob/master/docs/writing-a-plugin.md
];


export default {
	input: 'src/main.js',

	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'build/bundle.[hash].js',
	},

	onwarn: function (warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') return;
		warn(warning);
	},

	plugins: [
		copy({
			targets: [{ src: 'public/!(*.css)', dest: 'build' }],
		}),

		alias({
			resolve: ['.js', '.svelte'],
			entries: { '@': __dirname + '/src' }
		}),

		replace({
			process: JSON.stringify({
				env: { dev: !production }
			})
		}),

		svelte({ emitCss: true }),

		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),

		babel({
			extensions: ['.js', '.mjs', '.html', '.svelte'],
			include: ['src/**', 'node_modules/svelte/**'],
		}),

		yaml(),
		json(),
		dsv(),

		commonjs(),
		postcss({
			minimize: production,
			sourceMap: !production,
			plugins: postcssPlugins,
			extract: 'bundle.[hash].css',
		}),

		!production && serve({ contentBase: ['build'], port: 5000 }),
		!production && livereload({ watch: 'build', port: 35729 }),

		production && strip({
			include: '**/*.(js|mjs|html|svelte)',
			functions: ['console.log']
		}),

		// `toplevel: false` to fix an issue where terser redeclares variables.
		// https://github.com/TrySound/rollup-plugin-terser/issues/40
		production && terser({ toplevel: false })
	]
};
