import dts from "rollup-plugin-dts";

export default [
	// {
	// 	input: './script/goui.ts',
	// 	output: {
	// 		file: './build/goui.js',
	// 		format: 'esm',
	// 		sourcemap:true
	// 	},
	// 	plugins: [
	// 		esbuild({
	// 			tsconfig: "./tsconfig.build.json",
	// 			minify: true,
	// 			sourceMap:false
	// 			// format: "esm",
	// 			// target: "esnext"
	// 		}),
	// 		// typescript({
	// 		// 	tsconfig: "./tsconfig.json"
	// 		// }),
	// 		// sourcemaps()
	// 	],
	// },
	{
		input: "./types/goui.d.ts",
		output: [{ file: "build/goui.d.ts", format: "es" }],
		plugins: [dts()],
	}
	// ,
	// {
	// 	input: './script/goui.ts',
	// 	output: {
	// 		file: './build/goui.js',
	// 		format: 'cjs',
	// 	},
	// 	plugins: [typescript({
	// 		tsconfig: "./tsconfig.production.json",
	// 	})],
	// },
]