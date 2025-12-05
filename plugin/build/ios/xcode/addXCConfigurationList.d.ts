import { XcodeProject } from 'expo/config-plugins';
import { AddXCConfigurationListOptions } from './types';
export declare function addXCConfigurationList(xcodeProject: XcodeProject, { name, targetName, currentProjectVersion, bundleIdentifier, deploymentTarget, }: AddXCConfigurationListOptions): any;
