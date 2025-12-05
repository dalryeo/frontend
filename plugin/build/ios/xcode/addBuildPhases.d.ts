import { XcodeProject } from 'expo/config-plugins';
import { AddBuildPhasesOptions } from './types';
export declare function addBuildPhases(xcodeProject: XcodeProject, { targetUuid, groupName, productFile, watchFiles, resourceFiles, }: AddBuildPhasesOptions): void;
