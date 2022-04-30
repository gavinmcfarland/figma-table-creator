import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import svg from 'rollup-plugin-svg';
import typescript from 'rollup-plugin-typescript';
import { globalStyle } from 'svelte-preprocess';
import replace from '@rollup/plugin-replace';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json'
import nodePolyfills from 'rollup-plugin-node-polyfills'

/* Post CSS */
import postcss from 'rollup-plugin-postcss';
// import cssnano from 'cssnano';
import { stylup } from './stylup'

const processStylup = {
	markup({ content, filename }) {
		// phtml trips over sveltes markup attribute={handlerbars}. So this replaces those occurances with attribute="{handlebars}"
		content = content.replace(/(?<=\<[^>]*)=(\{[^{}]*\})/gmi, (match, p1) => {
			return `="${p1}"`
		})
		return stylup.process(content, { from: filename }).then(result => ({ code: result.html, map: null }));
	}
}

/* Inline to single html */
import htmlBundle from 'rollup-plugin-html-bundle';

const production = !process.env.ROLLUP_WATCH;


export default [{
	input: 'src/ui/main.js', // UI
	output: {
		format: 'iife',
		name: 'ui',
		file: 'src/ui/build/bundle.js'
	},
	plugins: [
		svelte({
			// enable run-time checks when not in production
			// dev: !production,
			preprocess:
				[// processStylup,
					// stylup,
					globalStyle()]
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:¡
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/'),
			extensions: ['.svelte', '.mjs', '.js', '.json', '.node']
		}),
		json(),
		commonjs(),
		svg(),
		postcss(),
		htmlBundle({
			template: 'src/template.html',
			target: 'dist/index.html',
			inline: true
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `dist` directory and refresh the
		// browser on changes when not in production
		!production && livereload('dist'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
},
{
	input: 'src/code/code.ts', // Code.js
	output: {
		file: 'dist/code.js',
		format: 'cjs',
		name: 'code'
	},
	plugins: [
		typescript(),
		nodePolyfills(),
		nodeResolve(),
		replace({
			'process.env.PKG_PATH': JSON.stringify(process.cwd() + '/package.json'),
			'process.env.VERSIONS_PATH': JSON.stringify(process.cwd() + '/.plugma/versions.json')
		}),
		json(),
		commonjs(),
		production && terser()
	]
}];

function serve() {
	let started = false;

	return {
		writeBundle() {
			if (!started) {
				started = true;

				require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
					stdio: ['ignore', 'inherit', 'inherit'],
					shell: true
				});
			}
		}
	};
}
