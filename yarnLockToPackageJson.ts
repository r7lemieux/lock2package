import * as fs from 'fs';

const lockStr: string = fs.readFileSync(`${__dirname}/yarn.lock`).toString()
const packStr: string = fs.readFileSync(`${__dirname}/package.json`).toString()
const pack = JSON.parse(packStr)

const extractYarnLibVersions = (): Map<string, string> => {
  const lockVersions: Map<string, string> = new Map()
  lockStr.split('\r\n\r\n')
    .filter((line, index) => index > 1)
    .map(lockLib => {
      const lockLines = lockLib.split(/(\r\n)/)
      const lockLine = lockLines[0]
      const libname = lockLine
        .match('^("?@?[A-z0-9\-\./]+)')[0]
        .replace('"', '')

      lockVersions[libname] = lockLines
        .find(line => line.search(/^\s{2}version/) >= 0)
        .trim()
        .split(' ')[1]
        .split('"')
        .join('')
    })
  return lockVersions
}

const setVersion = (lockVersions: Map<string, string>, deps: Map<String, String>) => {
  const libNames = Object.keys(deps)
  libNames.forEach(libName => {
    const version = lockVersions[libName]
    if (version) {
      deps[libName] = lockVersions[libName]
    } else {
      console.log(`Fail to find library ${libName} in yarn.lock`)
    }
  })
}

const versions = extractYarnLibVersions()
setVersion(versions, pack.dependencies)
setVersion(versions, pack.devDependencies)

console.log(pack)

