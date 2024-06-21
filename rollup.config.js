import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import externalGlobals from "rollup-plugin-external-globals";


const config = {
    input: 'dist/index.js',
    output: {
        file: 'dist/umd/colors.js',
        format: 'umd',
        name: 'Colors',
        exports: 'named',
        globals: {
           // 'chroma-js': 'chroma'
        }
    },
    plugins: [        
    ],
    external: [
        //'chroma-js'
    ]
};

const configs = [structuredClone(config), structuredClone(config)];

configs[0].plugins.push(resolve(),  externalGlobals({
    'chroma-js': 'chroma'
  }));


configs[1].output.file = 'dist/umd/colors.min.js';
configs[1].plugins.push(resolve(), terser(),  externalGlobals({
    'chroma-js': 'chroma'
  }));


export default configs;
