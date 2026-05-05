import {
  ConfigPlugin,
  withXcodeProject,
  XcodeProject,
} from 'expo/config-plugins';

import { addBuildPhases } from './addBuildPhases';
import { addPbxGroup } from './addPbxGroup';
import { addProductFile } from './addProductFile';
import { addSharedFiles } from './addSharedFiles';
import { addTargetDependency } from './addTargetDependency';
import { addToPbxNativeTargetSection } from './addToPbxNativeTargetSection';
import { addToPbxProjectSection } from './addToPbxProjectSection';
import { addXCConfigurationList } from './addXCConfigurationList';
import { WatchAppConfig } from './types';

declare const process: {
  env: { [key: string]: string | undefined };
};

export const withXcode: ConfigPlugin<WatchAppConfig> = (
  config,
  { name, targetName, bundleIdentifier, deploymentTarget, files },
) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults as XcodeProject;
    const targetUuid = xcodeProject.generateUuid();
    const groupName = 'Embed Watch Content';
    const appleTeamIdentifier = process.env.APPLE_TEAM_ID;

    if (!appleTeamIdentifier) {
      throw new Error(
        'APPLE_TEAM_ID 환경 변수가 누락되었습니다. 로컬의 .env 또는 EAS Build 환경 변수에 Team ID를 설정해주세요.',
      );
    }

    // 1. 빌드 설정 생성
    const xCConfigurationList = addXCConfigurationList(xcodeProject, {
      name,
      targetName,
      currentProjectVersion: config.ios!.buildNumber ?? '1.0',
      bundleIdentifier,
      deploymentTarget,
      appleTeamIdentifier,
    });
    // 2. 제품 파일 추가
    const productFile = addProductFile(xcodeProject, {
      targetName,
      groupName,
    });
    // 3. 네이티브 타겟 등록
    const target = addToPbxNativeTargetSection(xcodeProject, {
      targetName,
      targetUuid,
      productFile,
      xCConfigurationList,
    });
    // 4. 의존성 연결
    addTargetDependency(xcodeProject, target);
    // 5. 프로젝트 섹션에 추가
    addToPbxProjectSection(xcodeProject, target);
    // 6. 파일 그룹 생성
    addPbxGroup(xcodeProject, {
      targetName,
      watchFiles: files.watch,
      resourceFiles: files.resources,
    });
    // 7. 빌드 페이즈 추가
    addBuildPhases(xcodeProject, {
      targetUuid,
      groupName,
      productFile,
      watchFiles: files.watch,
      resourceFiles: files.resources,
    });
    // 8. 공유 파일 처리
    addSharedFiles(xcodeProject, {
      sharedFiles: files.shared,
      watchTargetUuid: targetUuid,
    });

    return config;
  });
};
