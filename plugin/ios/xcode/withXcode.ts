import {
  ConfigPlugin,
  withXcodeProject,
  XcodeProject,
} from 'expo/config-plugins';
import { addXCConfigurationList } from './addXCConfigurationList';
import { addProductFile } from './addProductFile';
import { addToPbxNativeTargetSection } from './addToPbxNativeTargetSection';
import { addTargetDependency } from './addTargetDependency';
import { addToPbxProjectSection } from './addToPbxProjectSection';
import { addPbxGroup } from './addPbxGroup';
import { addBuildPhases } from './addBuildPhases';
import { addSharedFiles } from './addSharedFiles';

export const withXcode: ConfigPlugin<{
  name: string;
  targetName: string;
  bundleIdentifier: string;
  deploymentTarget: string;
}> = (config, { name, targetName, bundleIdentifier, deploymentTarget }) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults as XcodeProject;
    const targetUuid = xcodeProject.generateUuid();
    const groupName = 'Embed Watch Content';
    const xCConfigurationList = addXCConfigurationList(xcodeProject, {
      name,
      targetName,
      currentProjectVersion: config.ios!.buildNumber ?? '1.0',
      bundleIdentifier,
      deploymentTarget,
    });

    const productFile = addProductFile(xcodeProject, {
      targetName,
      groupName,
    });

    const target = addToPbxNativeTargetSection(xcodeProject, {
      targetName,
      targetUuid,
      productFile,
      xCConfigurationList,
    });

    addTargetDependency(xcodeProject, target);
    addToPbxProjectSection(xcodeProject, target);
    addPbxGroup(xcodeProject, {
      targetName,
    });

    addBuildPhases(xcodeProject, {
      targetUuid,
      groupName,
      productFile,
    });

    addSharedFiles(xcodeProject, {
      sharedFiles: [
        'Logger.swift',
        'WorkoutControlling.swift',
        'WorkoutError.swift',
        'WorkoutMetrics.swift',
      ],
      watchTargetUuid: targetUuid,
    });

    return config;
  });
};
