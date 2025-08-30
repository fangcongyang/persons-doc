import { resolve } from 'path'
import process from 'process'
import consola from 'consola'

export const projRoot = resolve(__dirname, '..', '..')

// Docs
export const docsDirName = 'docs'
export const docRoot = resolve(projRoot, docsDirName)
export const vpRoot = resolve(docRoot, '.vitepress')

export const docPackage = resolve(projRoot, 'package.json')

export function errorAndExit(err: Error): never {
    consola.error(err)
    process.exit(1)
  }

  export const getPackageManifest = (pkgPath: string) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(pkgPath) as ProjectManifest
  }

  export const getPackageDependencies = (
    pkgPath: string
  ): Record<'dependencies' | 'peerDependencies', string[]> => {
    const manifest = getPackageManifest(pkgPath)
    const { dependencies = {}, peerDependencies = {} } = manifest
  
    return {
      dependencies: Object.keys(dependencies),
      peerDependencies: Object.keys(peerDependencies),
    }
  }