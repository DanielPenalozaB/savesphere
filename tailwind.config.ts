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
					"50": "#fafee8",
					"100": "#f3ffc2",
					"200": "#ecff88",
					"300": "#e8ff45",
					"400": "#ebfd12",
					DEFAULT: "#eaf205",
					"600": "#cdc401",
					"700": "#a38e05",
					"800": "#876f0c",
					"900": "#725a11",
					"950": "#433105",
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
