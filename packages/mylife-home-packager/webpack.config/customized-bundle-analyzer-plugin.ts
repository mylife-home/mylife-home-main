import { Compiler } from 'webpack';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

export default class CustomizedBundleAnalyzerPlugin extends BundleAnalyzerPlugin {
  apply(compiler: Compiler) {
    const name = Object.keys(compiler.options.entry)[0];
    
    // opts are not public on BundleAnalyzerPlugin
    (this as any).opts.reportFilename = `${name}.report.html`;
    (this as any).opts.reportTitle = `${name} [${currentTime()}]`;
    
    return super.apply(compiler);
  }
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function currentTime() {
  const time = new Date();
  const year = time.getFullYear();
  const month = MONTHS[time.getMonth()];
  const day = time.getDate();
  const hour = `0${time.getHours()}`.slice(-2);
  const minute = `0${time.getMinutes()}`.slice(-2);

  return `${day} ${month} ${year} at ${hour}:${minute}`;
}
