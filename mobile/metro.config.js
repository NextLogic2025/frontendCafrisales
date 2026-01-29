const path = require('path')

const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
const sharedTypesPath = path.resolve(workspaceRoot, 'shared', 'types')

const config = getDefaultConfig(projectRoot)

// Enable tree shaking and dead code elimination
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    compress: {
      drop_console: process.env.NODE_ENV === 'production',
      dead_code: true,
      unused: true,
    },
  },
}

// Monorepo: permite importar paquetes del workspace (ej. `@cafrilosa/shared-types`).
// Evita romper Metro cuando el workspace no existe en esta maquina.
config.watchFolders = sharedTypesPath && require('fs').existsSync(sharedTypesPath)
  ? [sharedTypesPath]
  : []
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = true

module.exports = withNativeWind(config, {
  input: path.join(projectRoot, 'global.css'),
  configPath: path.join(projectRoot, 'tailwind.config.js'),
})
