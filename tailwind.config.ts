import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				montserrat: ["var(--font-montserrat)"],
			},
			colors: {
				savesphere: {
					'50': '#f3f6fb',
					'100': '#e5e9f4',
					'200': '#d0d9ed',
					'300': '#b0c0e0',
					'400': '#8a9fd0',
					DEFAULT: '#6a7fc1',
					'600': '#5b6bb5',
					'700': '#505aa5',
					'800': '#464c87',
					'900': '#3c416c',
					'950': '#282a43',
				},
			},
			borderWidth: {
				"1": "1px",
				"1.5": "1.5px",
				"2": "2px",
				"2.5": "2.5px",
				"3": "3px",
				"3.5": "3.5px",
				"4": "4px",
				"4.5": "4.5px",
				"5": "5px",
				"5.5": "5.5px",
				"6": "6px",
			},
			strokeWidth: {
				"1": "1px",
				"1.5": "1.5px",
				"2": "2px",
				"2.5": "2.5px",
				"3": "3px",
				"3.5": "3.5px",
				"4": "4px",
				"4.5": "4.5px",
				"5": "5px",
				"5.5": "5.5px",
				"6": "6px",
			},
		},
	},
	plugins: [],
	darkMode: "class",
};
export default config;
