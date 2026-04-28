/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'primary': '#3b82f6',
				'secondary': '#64748b',
				'accent': '#8b5cf6',
				'dark': '#0f172a',
				'darker': '#020617',
				'surface': '#1e293b'
			}
		}
	},
	plugins: []
};
