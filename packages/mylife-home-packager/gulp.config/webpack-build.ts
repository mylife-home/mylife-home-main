import webpack, { Configuration } from 'webpack';
import configFactory from '../webpack.config';

export type Binary = string;
export type Mode = 'prod' | 'dev';

export function createWebpackTask(binary: Binary, mode: Mode) {
  const config = configFactory({ binary, mode });
  const task = async () => {
    await compile(config);
  };

  Object.assign(task, { displayName: `webpack-build - ${binary} (${mode})` });

  return task;
}

async function compile(config: Configuration[]) {
  return new Promise<void>((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        return reject(err);
      }

      if (stats.hasErrors()) {
        const errors: string[] = [];
        for (const { compilation } of stats.stats) {
          for (const error of compilation.errors) {
            errors.push(error.toString());
          }
        }
        return reject(new Error(errors.join('\n')));
      }

      if (stats.hasWarnings) {
        for (const { compilation } of stats.stats) {
          for (const warning of compilation.warnings) {
            console.log(warning.toString());
          }
        }
      }

      resolve();
    });
  });
}