import tsc from 'rollup-plugin-typescript2';
import { uglify } from 'rollup-plugin-uglify';

export default [
  {
    input: 'src/node-html.ts',
    output: {
      file: 'dist/node-html.umd.min.js',
      format: 'umd',
      name: 'registerCytoscapeNodeHtmlPlugin'
    },
    plugins: [
      tsc({ target: 'es5' })
    ].concat(
      process.env.NODE_ENV === 'production' && !process.env.SKIP_MINIFY ? uglify() : []
    )
  },
  {
    input: 'src/node-html.ts',
    output: {
      file: 'dist/node-html.es.js',
      format: 'es'
    },
    plugins: [
      tsc({ target: 'es6' })
    ]
  },
];
