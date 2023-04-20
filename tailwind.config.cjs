/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}', require('path').join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')],
	theme: {
		extend: {
			colors: {
				dark: {
					600: '#252525',
					800: '#131313'
				}
			}, 
			spacing: {
				'18': '5rem'
			}
		},
	},
	plugins: [require('@tailwindcss/typography'), ...require('@skeletonlabs/skeleton/tailwind/skeleton.cjs')()],
}
