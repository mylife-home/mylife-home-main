import webpack, { Compiler } from 'webpack';
import { Mode, getConfigurationFactory, createContext } from '../webpack.config';

export class WebpackBuild {
  private readonly compiler: Compiler;

  constructor(binary: string, part: string, mode: Mode) {
    const context = createContext(mode);
    const configurationFactory = getConfigurationFactory(binary, part);
    const config = configurationFactory(context);

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
          return reject(new Error(stats.compilation.errors.join('\n')));
        }

        if (stats.hasWarnings) {
          for (const warning of stats.compilation.warnings) {
            console.log(warning.toString());
          }
        }

        resolve();
      });
    });
  };
}
