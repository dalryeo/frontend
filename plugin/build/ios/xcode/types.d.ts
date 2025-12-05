export interface WatchAppFiles {
    watch: string[];
    shared: string[];
    resources: string[];
}
export interface WatchAppConfig {
    name: string;
    targetName: string;
    bundleIdentifier: string;
    deploymentTarget: string;
    files: WatchAppFiles;
}
export interface WithWatchRunningOptions {
    deploymentTarget: string;
    files: WatchAppFiles;
}
export interface WithIosRunningOptions {
    deploymentTarget: string;
}
export declare const DEFAULT_FILES: WatchAppFiles;
export interface AddBuildPhasesOptions {
    targetUuid: string;
    groupName: string;
    productFile: {
        uuid: string;
        target: string;
        basename: string;
        group: string;
    };
    watchFiles: string[];
    resourceFiles: string[];
}
export interface AddPbxGroupOptions {
    targetName: string;
    watchFiles: string[];
    resourceFiles: string[];
}
export interface AddSharedFilesOptions {
    sharedFiles: string[];
    watchTargetUuid: string;
}
export interface AddXCConfigurationListOptions {
    name: string;
    targetName: string;
    currentProjectVersion: string;
    bundleIdentifier: string;
    deploymentTarget: string;
}
export interface AddProductFileOptions {
    targetName: string;
    groupName: string;
}
export interface AddToPbxNativeTargetSectionOptions {
    targetName: string;
    targetUuid: string;
    productFile: {
        fileRef: string;
    };
    xCConfigurationList: {
        uuid: string;
    };
}
