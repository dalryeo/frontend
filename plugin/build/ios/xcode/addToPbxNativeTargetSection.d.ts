import { XcodeProject } from 'expo/config-plugins';
import { AddToPbxNativeTargetSectionOptions } from './types';
export declare function addToPbxNativeTargetSection(xcodeProject: XcodeProject, { targetName, targetUuid, productFile, xCConfigurationList, }: AddToPbxNativeTargetSectionOptions): {
    uuid: string;
    pbxNativeTarget: {
        isa: string;
        buildConfigurationList: string;
        buildPhases: never[];
        buildRules: never[];
        dependencies: never[];
        name: string;
        productName: string;
        productReference: string;
        productType: string;
    };
};
