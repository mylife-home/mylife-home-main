import fs from 'fs';
import path from 'path';
import { TsBuild } from './ts-build';

export class PackageBuild {
  private readonly packagePath: string;
  public readonly dependencies: string[];
  private readonly srcBuild: TsBuild;
  public readonly hasPublic: boolean;

  constructor(packageName: string) {
    this.packagePath = path.dirname(require.resolve(`${packageName}/package.json`));
    const packageData = require(path.join(this.packagePath, 'package.json'));

    const prefix = 'mylife-home-';
    this.dependencies = Object.keys(packageData.dependencies).filter(dependency => dependency.startsWith(prefix));

    const hasSrc = fs.existsSync(path.join(this.packagePath, 'src'));
    if (hasSrc) {
      this.srcBuild = new TsBuild(packageName);
    }

    this.hasPublic = fs.existsSync(path.join(this.packagePath, 'public'));
  }

  get hasSrc() {
    return !!this.srcBuild;
  }

  get srcGlobs() {
    if (!this.hasSrc) {
      throw new Error('no src');
    }

    return this.srcBuild.globs;
  }

  get srcTask() {
    if (!this.hasSrc) {
      throw new Error('no src');
    }

    return this.srcBuild.task;
  }

  get publicGlobs() {
    if (!this.hasPublic) {
      throw new Error('no public');
    }

    return [path.join(this.packagePath, 'public/**/*')];
  }

}
