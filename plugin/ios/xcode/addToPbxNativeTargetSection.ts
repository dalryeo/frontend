import { XcodeProject } from 'expo/config-plugins';

import { AddToPbxNativeTargetSectionOptions } from './types';

export function addToPbxNativeTargetSection(
  xcodeProject: XcodeProject,
  {
    targetName,
    targetUuid,
    productFile,
    xCConfigurationList,
  }: AddToPbxNativeTargetSectionOptions
) {
  const target = {
    uuid: targetUuid,
    pbxNativeTarget: {
      isa: 'PBXNativeTarget',
      buildConfigurationList: xCConfigurationList.uuid,
      buildPhases: [],
      buildRules: [],
      dependencies: [],
      name: `"${targetName}"`,
      productName: `"${targetName}"`,
      productReference: productFile.fileRef,
      productType: `"com.apple.product-type.application"`,
    },
  };

  xcodeProject.addToPbxNativeTargetSection(target);

  return target;
}
