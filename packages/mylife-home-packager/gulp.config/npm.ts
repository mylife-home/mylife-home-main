import { promises as fs } from 'fs';
import path from 'path';
import versionExists from 'version-exists';
import { src, dest, series, parallel } from 'gulp';
import { withTempPath, name, run } from './utils';

export interface NpmPublishTaskOptions {
  readonly binariesGlob: string;
  readonly repositoryName: string;
}

export function createNpmPublishTask(options: NpmPublishTaskOptions) {
  return withTempPath('npm-publish-', (tempPathRef) =>
    series(
      parallel(
        name('copy package.json', () => src(makePackageJsonPath(options)).pipe(dest(tempPathRef.path))),
        name('copy binaries', () => src(makeBinariesPath(options)).pipe(dest(tempPathRef.path)))
      ),
      name('npm publish', async () => {
        const { name, version } = JSON.parse(await fs.readFile(path.join(tempPathRef.path, 'package.json'), 'utf8'));
        const exists = await safeVersionExists(name, version);
        if (exists) {
          console.log(`Skipping npm publish of '${name}@${version}' because it does already exist.`);
          return;
        }

        await new Promise<void>((resolve, reject) => {
          const child = run('npm', 'publish', tempPathRef.path);

          child.on('error', reject);
          child.on('exit', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Exited with code ${code}`));
            }
          });
        });
      })
    )
  );
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

async function safeVersionExists(module: string, version: string) {
  try {
    return await versionExists(module, version);
  } catch (stringError) {
    // sadly ...
    if (stringError === `Error > Cannot find ${module} in the NPM registry`) {
      return false;
    }

    throw new Error(stringError);
  }
}
