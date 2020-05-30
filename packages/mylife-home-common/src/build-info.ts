// cf packager build info

export interface ModuleBuildInfo {
  readonly moduleName: string;
  readonly version: string;
}

export interface BuildInfo {
  readonly timestamp: Date;
  readonly modules: { [name: string]: ModuleBuildInfo };
}

const info = extractInfo();

export function getInfo() {
  return info;
}

interface WebpackModuleBuildInfo {
  readonly version: string;
}

interface WebpackBuildInfo {
  readonly timestamp: number;
  readonly modules: { [name: string]: WebpackModuleBuildInfo };
}

declare var __WEBPACK_BUILD_INFO__: WebpackBuildInfo;

function extractInfo(): BuildInfo {
  const rawInfo = __WEBPACK_BUILD_INFO__;

  const modules: { [name: string]: ModuleBuildInfo } = {};

  for (const [name, rawModule] of Object.entries(rawInfo.modules)) {
    modules[name] = {
      moduleName: name,
      version: rawModule.version,
    };
  }

  return {
    timestamp: new Date(rawInfo.timestamp),
    modules,
  };
}
