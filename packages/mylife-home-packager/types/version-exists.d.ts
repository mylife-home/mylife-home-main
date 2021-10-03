declare module 'version-exists' {
  export default function versionExists(module: string, version: string): Promise<boolean>;
}
