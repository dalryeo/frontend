import { XcodeProject } from 'expo/config-plugins';

import { AddProductFileOptions } from './types';

export function addProductFile(
  xcodeProject: XcodeProject,
  { targetName, groupName }: AddProductFileOptions
) {
  const options = {
    basename: `${targetName}`,
    group: groupName,
    explicitFileType: 'wrapper.application',
    settings: {
      ATTRIBUTES: ['RemoveHeadersOnCopy'],
    },
    includeInIndex: 0,
    path: `${targetName}`,
    sourceTree: 'BUILT_PRODUCTS_DIR',
  };

  const productFile = xcodeProject.addProductFile(targetName, options);

  return productFile;
}
