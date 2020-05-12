import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from '@rollup/plugin-json';

// module.exports = {
//   plugins: [nodeRequire(), commonjs()],
// };

const NODE_NATIVES = [
  'path',
  'fs',
  'os',
  'buffer',
  'crypto',
  'util',
  'child_process',
  'perf_hooks',
];
export default {
  // input: 'src/index.js',
  // output: {
  //   dir: 'output',
  //   format: 'cjs'
  // },
  external: [],
  plugins: [json(), resolve(), commonjs()],
};
