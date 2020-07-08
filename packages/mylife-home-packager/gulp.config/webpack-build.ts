import webpack, { Compiler } from 'webpack';
import { Mode, getConfigurationFactory, createContext } from '../webpack.config';

export class WebpackBuild {
  private readonly compiler: Compiler;

  constructor(binary: string, part: string, mode: Mode) {
    const context = createContext(mode);
    const configurationFactory = getConfigurationFactory(binary, part);
    const config = configurationFactory(context);

    this.compiler = webpack(config);
    Object.assign(this.task, { displayName: `webpack-build - ${binary}/${part} (${mode})` });
  }

  readonly task = async () => {
    return new Promise<void>((resolve, reject) => {
      this.compiler.run((err, stats) => {
        if (err) {
          return reject(err);
        }

        if (stats.hasErrors() || stats.hasWarnings()) {
          // seen in https://github.com/webpack/webpack-cli/blob/next/packages/webpack-cli/lib/utils/CompilerOutput.js
          process.stdout.write(stats.toString() + '\n');
          return reject(new Error(stats.compilation.errors.join('\n')));
        }

        if (stats.hasErrors()) {
          return reject(new Error('Compilation errors'));
        }

        resolve();
      });
    });
  };
}
