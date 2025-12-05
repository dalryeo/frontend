import { XcodeProject } from 'expo/config-plugins';
import util from 'util';

import { AddBuildPhasesOptions } from './types';

export function addBuildPhases(
  xcodeProject: XcodeProject,
  {
    targetUuid,
    groupName,
    productFile,
    watchFiles,
    resourceFiles,
  }: AddBuildPhasesOptions
) {
  const buildPath = `"$(CONTENTS_FOLDER_PATH)/Watch"`;
  const folderType = 'watch2_app';

  // Sources build phase
  xcodeProject.addBuildPhase(
    watchFiles,
    'PBXSourcesBuildPhase',
    groupName,
    targetUuid,
    folderType,
    buildPath
  );

  // Copy files build phase
  xcodeProject.addBuildPhase(
    [],
    'PBXCopyFilesBuildPhase',
    groupName,
    xcodeProject.getFirstTarget().uuid,
    folderType,
    buildPath
  );

  xcodeProject
    .buildPhaseObject('PBXCopyFilesBuildPhase', groupName, productFile.target)
    .files.push({
      value: productFile.uuid,
      comment: util.format('%s in %s', productFile.basename, productFile.group),
    });
  xcodeProject.addToPbxBuildFileSection(productFile);

  // Frameworks build phase
  xcodeProject.addBuildPhase(
    [],
    'PBXFrameworksBuildPhase',
    groupName,
    targetUuid,
    folderType,
    buildPath
  );

  // Resources build phase
  xcodeProject.addBuildPhase(
    resourceFiles,
    'PBXResourcesBuildPhase',
    groupName,
    targetUuid,
    folderType,
    buildPath
  );
}
