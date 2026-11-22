// Which dataset the generator scripts build: DATASET=extended adds the color-name-list names.
export const dataset = process.env.DATASET ?? 'native'
if (!['native', 'extended'].includes(dataset)) throw new Error(`unknown DATASET "${dataset}", use native or extended`)
export const isExtended = dataset === 'extended'
export const datasetSuffix = isExtended ? '.extended' : ''
