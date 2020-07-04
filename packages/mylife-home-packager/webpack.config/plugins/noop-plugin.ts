import { WebpackPluginInstance, Compiler } from 'webpack';

export default class NoopPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler) {
  }
}
