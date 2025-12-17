import { XcodeProject } from 'expo/config-plugins';

import { AddPbxGroupOptions } from './types';

export function addPbxGroup(
  xcodeProject: XcodeProject,
  { targetName, watchFiles, resourceFiles }: AddPbxGroupOptions,
) {
  const entitlementsFile = `${targetName}.entitlements`;
  const infoPlistFile = `${targetName.replace(/ /g, '-')}-Info.plist`;

  const allFiles = [
    ...resourceFiles,
    ...watchFiles,
    entitlementsFile,
    infoPlistFile,
  ];

  const { uuid: pbxGroupUuid } = xcodeProject.addPbxGroup(
    allFiles,
    `"${targetName}"`,
    `"../${targetName}"`,
  );

  const groups = xcodeProject.hash.project.objects['PBXGroup'];
  if (pbxGroupUuid) {
    Object.keys(groups).forEach(function (key) {
      if (groups[key].name === undefined && groups[key].path === undefined) {
        xcodeProject.addToPbxGroup(pbxGroupUuid, key);
      }
    });
  }
}
