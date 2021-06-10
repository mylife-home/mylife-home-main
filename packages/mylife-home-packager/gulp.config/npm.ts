
export interface NpmPublishTaskOptions {
  readonly binaries: string;
  readonly repositoryName: string;
}

export function createNpmPublishTask(options: NpmPublishTaskOptions) {
  // TODO: check existency + publish
  // TODO: check plugins management
  return async () => {};
}
