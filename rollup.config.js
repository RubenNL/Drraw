import del from 'rollup-plugin-delete'
import fg from 'fast-glob'
import {terser} from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import {nodeResolve} from '@rollup/plugin-node-resolve'
import minifyHTML from 'rollup-plugin-minify-html-literals'
const production = process.env.NODE_ENV == 'production'
console.log('ENVIRONMENT:', production ? 'prod' : 'dev')
export default {
	input: 'src/index.js',
	treeshake: production,
	output: {
		dir: 'output',
		format: 'es',
		preserveModules: !production,
		preserveModulesRoot: 'src',
	},
	watch: {
		exclude: 'node_modules/**, server/**',
	},
	preserveEntrySignatures: 'allow-extension',
	plugins: [
		del({targets: 'output/*', runOnce: true}),
		nodeResolve({moduleDirectories: ['node_modules', 'src']}),
		copy({
			targets: [
				{src: 'src/images/*', dest: 'output/images'},
				{src: 'src/manifest.json', dest: 'output'},
				{src: 'src/service-worker.js', dest: 'output'},
				{src: 'src/index.html', dest: 'output'},
				{src: 'src/robots.txt', dest: 'output'},
				{src: 'node_modules/dialog-polyfill/dist/dialog-polyfill.css', dest: 'output'},
				{src: 'node_modules/@fortawesome/fontawesome-free/sprites', dest: 'output/node_modules/@fortawesome/fontawesome-free'},
			],
		}),
		...(production
			? [minifyHTML(), terser()]
			: [
					{
						name: 'watch-external',
						async buildStart() {
							const files = await fg('src/**/*')
							for (let file of files) {
								this.addWatchFile(file)
							}
						},
					},
			  ]),
	],
}
