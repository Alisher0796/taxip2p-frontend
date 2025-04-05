/**
 * Feature-Sliced Design layer types
 * @see https://feature-sliced.design/
 */
export const FSDLayers = {
  app: 'app',
  pages: 'pages',
  widgets: 'widgets',
  features: 'features',
  entities: 'entities',
  shared: 'shared',
} as const

export type FSDLayer = typeof FSDLayers[keyof typeof FSDLayers]

/**
 * Feature-Sliced Design segment types
 */
export const FSDSegments = {
  ui: 'ui',
  model: 'model',
  lib: 'lib',
  api: 'api',
  config: 'config',
} as const

export type FSDSegment = typeof FSDSegments[keyof typeof FSDSegments]
