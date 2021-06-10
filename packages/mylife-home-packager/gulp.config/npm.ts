import path from 'path';
import { src, dest, series, parallel } from 'gulp';
import { withTempPath, name } from './utils';
import fs from 'fs';

export interface NpmPublishTaskOptions {
  readonly binariesGlob: string;
  readonly repositoryName: string;
}

export function createNpmPublishTask(options: NpmPublishTaskOptions) {
  // TODO: check existency + publish
  // TODO: check plugins management
  // TODO: put binaries in temp folder, then npm publish <folder> <tag>
  return withTempPath('npm-publish-', tempPathRef => series(
    parallel(
      name('copy package.json', () => src(makePackageJsonPath(options)).pipe(dest(tempPathRef.path))),
      name('copy binaries', () => src(makeBinariesPath(options)).pipe(dest(tempPathRef.path)))
    ),
    async() => { console.log(options.repositoryName, fs.readdirSync(tempPathRef.path)); }
  ));
}

function makeBinariesPath(options: NpmPublishTaskOptions) {
  const basePath = path.resolve(path.join(__dirname, '..'));
  const glob = path.join(basePath, options.binariesGlob);
  return [glob, '!**/*.report.html'];
}

function makePackageJsonPath(options: NpmPublishTaskOptions) {
  const packagePath = path.dirname(require.resolve(`${options.repositoryName}/package.json`));
  return path.join(packagePath, 'package.json');
}