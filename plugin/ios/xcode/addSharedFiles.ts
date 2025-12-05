import { XcodeProject } from 'expo/config-plugins';

import { AddSharedFilesOptions } from './types';

export function addSharedFiles(
  xcodeProject: XcodeProject,
  { sharedFiles, watchTargetUuid }: AddSharedFilesOptions
) {
  const iosTargetUuid = xcodeProject.getFirstTarget().uuid;
  const sharedPath = '"../modules/workout/ios/Shared"';

  // 1. Shared 그룹 생성
  const { uuid: sharedGroupUuid } = xcodeProject.addPbxGroup(
    [],
    '"Shared"',
    sharedPath
  );

  // 루트 그룹에 추가
  const groups = xcodeProject.hash.project.objects['PBXGroup'];
  Object.keys(groups).forEach((key) => {
    if (groups[key].name === undefined && groups[key].path === undefined) {
      xcodeProject.addToPbxGroup(sharedGroupUuid, key);
    }
  });

  // 2. 각 파일 처리
  sharedFiles.forEach((fileName) => {
    // PBXFileReference (1개)
    const fileRefUuid = xcodeProject.generateUuid();
    xcodeProject.hash.project.objects['PBXFileReference'][fileRefUuid] = {
      isa: 'PBXFileReference',
      lastKnownFileType: 'sourcecode.swift',
      path: `"${fileName}"`,
      sourceTree: '"<group>"',
    };
    xcodeProject.hash.project.objects['PBXFileReference'][
      `${fileRefUuid}_comment`
    ] = fileName;

    // 그룹에 파일 추가
    groups[sharedGroupUuid].children.push({
      value: fileRefUuid,
      comment: fileName,
    });

    // iOS용 PBXBuildFile
    const iosBuildUuid = xcodeProject.generateUuid();
    xcodeProject.hash.project.objects['PBXBuildFile'][iosBuildUuid] = {
      isa: 'PBXBuildFile',
      fileRef: fileRefUuid,
    };
    xcodeProject.hash.project.objects['PBXBuildFile'][
      `${iosBuildUuid}_comment`
    ] = `${fileName} in Sources`;

    // watchOS용 PBXBuildFile (같은 fileRef)
    const watchBuildUuid = xcodeProject.generateUuid();
    xcodeProject.hash.project.objects['PBXBuildFile'][watchBuildUuid] = {
      isa: 'PBXBuildFile',
      fileRef: fileRefUuid,
    };
    xcodeProject.hash.project.objects['PBXBuildFile'][
      `${watchBuildUuid}_comment`
    ] = `${fileName} in Sources`;

    // Build Phase에 추가
    addToSourcesBuildPhase(xcodeProject, iosTargetUuid, iosBuildUuid, fileName);
    addToSourcesBuildPhase(
      xcodeProject,
      watchTargetUuid,
      watchBuildUuid,
      fileName
    );
  });
}

function addToSourcesBuildPhase(
  xcodeProject: XcodeProject,
  targetUuid: string,
  buildFileUuid: string,
  fileName: string
) {
  const buildPhases = xcodeProject.hash.project.objects['PBXSourcesBuildPhase'];
  const nativeTargets = xcodeProject.hash.project.objects['PBXNativeTarget'];
  const target = nativeTargets[targetUuid];

  if (!target?.buildPhases) return;

  for (const phase of target.buildPhases) {
    const phaseUuid = phase.value || phase;
    if (buildPhases[phaseUuid]) {
      buildPhases[phaseUuid].files.push({
        value: buildFileUuid,
        comment: `${fileName} in Sources`,
      });
      break;
    }
  }
}
