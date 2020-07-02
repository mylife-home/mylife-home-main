import webpack, { Configuration, MultiCompiler } from 'webpack';
import configFactory from '../webpack.config';

export type Binary = string;
export type Mode = 'prod' | 'dev';

export class WebpackBuild {
  private readonly compiler: MultiCompiler;

  constructor(binary: Binary, mode: Mode) {
    const config = configFactory({ binary, mode });
    this.compiler = webpack(config);
    Object.assign(this.task, { displayName: `webpack-build - ${binary} (${mode})` });
  }

  readonly task = async () => {
    return new Promise<void>((resolve, reject) => {
      this.compiler.run((err, stats) => {
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
  };
}
