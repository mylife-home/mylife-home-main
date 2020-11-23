import { Context } from '../context';
import { prepareServerConfiguration, prepareClientConfiguration } from './common/tools';

export const bin = (context: Context) => prepareServerConfiguration(context, {
  entry: {
    'ui/bin': 'mylife-home-ui/dist/src/bin',
  },
});

export const client = (context: Context) => prepareClientConfiguration(context, 'mylife-home-ui', 'ui', {
  resolve: {
    // https://preactjs.com/guide/v10/getting-started#aliasing-react-to-preact
    alias: {
      "react": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
    },
  }
}, ['ios_saf 9.3.5']);
