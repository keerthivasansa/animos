import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		})
	],
	kit: {
		adapter: adapter({
			pages: '../output',
			fallback: 'index.html'
		}),
		prerender: {
			entries: []
		},
		alias: {
			'$bg/*': '../backend/*',
			"$electron-src/*": "../electron-src/*",
			"$lib/*": "src/lib/*"
		},
		csp: {
			mode: 'auto',
			directives: {
				'script-src': ['self', 'unsafe-inline', 'blob:'],
				'style-src': ['self', 'cdn.plyr.io', 'fonts.googleapis.com'],
				'media-src': ['*', 'blob:'],
				'object-src': ['none']
			}
		}
	}
};

export default config;
