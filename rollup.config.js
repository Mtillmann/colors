import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const config = {
    input: 'dist/index.js',
    output: {
        file: 'dist/umd/colors.js',
        format: 'umd',
        name: 'Colors',
        exports: 'named',
        globals: {
            'chroma-js': 'chroma'
        }
    },
    plugins: [
    ],
    external: [
        'chroma-js'
    ]
};

const configs = [structuredClone(config), structuredClone(config)];

configs[0].plugins.push(resolve());

configs[1].output.file = 'dist/umd/colors.min.js';
configs[1].plugins.push(resolve(), terser());

export default configs;
