"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withXcode = void 0;
const config_plugins_1 = require("expo/config-plugins");
const addBuildPhases_1 = require("./addBuildPhases");
const addPbxGroup_1 = require("./addPbxGroup");
const addProductFile_1 = require("./addProductFile");
const addSharedFiles_1 = require("./addSharedFiles");
const addTargetDependency_1 = require("./addTargetDependency");
const addToPbxNativeTargetSection_1 = require("./addToPbxNativeTargetSection");
const addToPbxProjectSection_1 = require("./addToPbxProjectSection");
const addXCConfigurationList_1 = require("./addXCConfigurationList");
const withXcode = (config, { name, targetName, bundleIdentifier, deploymentTarget, files }) => {
    return (0, config_plugins_1.withXcodeProject)(config, (config) => {
        const xcodeProject = config.modResults;
        const targetUuid = xcodeProject.generateUuid();
        const groupName = 'Embed Watch Content';
        const appleTeamIdentifier = process.env.APPLE_TEAM_ID;
        if (!appleTeamIdentifier) {
            throw new Error('APPLE_TEAM_ID 환경 변수가 누락되었습니다. 로컬의 .env 또는 EAS Build 환경 변수에 Team ID를 설정해주세요.');
        }
        // 1. 빌드 설정 생성
        const xCConfigurationList = (0, addXCConfigurationList_1.addXCConfigurationList)(xcodeProject, {
            name,
            targetName,
            currentProjectVersion: config.ios.buildNumber ?? '1.0',
            bundleIdentifier,
            deploymentTarget,
            appleTeamIdentifier,
        });
        // 2. 제품 파일 추가
        const productFile = (0, addProductFile_1.addProductFile)(xcodeProject, {
            targetName,
            groupName,
        });
        // 3. 네이티브 타겟 등록
        const target = (0, addToPbxNativeTargetSection_1.addToPbxNativeTargetSection)(xcodeProject, {
            targetName,
            targetUuid,
            productFile,
            xCConfigurationList,
        });
        // 4. 의존성 연결
        (0, addTargetDependency_1.addTargetDependency)(xcodeProject, target);
        // 5. 프로젝트 섹션에 추가
        (0, addToPbxProjectSection_1.addToPbxProjectSection)(xcodeProject, target);
        // 6. 파일 그룹 생성
        (0, addPbxGroup_1.addPbxGroup)(xcodeProject, {
            targetName,
            watchFiles: files.watch,
            resourceFiles: files.resources,
        });
        // 7. 빌드 페이즈 추가
        (0, addBuildPhases_1.addBuildPhases)(xcodeProject, {
            targetUuid,
            groupName,
            productFile,
            watchFiles: files.watch,
            resourceFiles: files.resources,
        });
        // 8. 공유 파일 처리
        (0, addSharedFiles_1.addSharedFiles)(xcodeProject, {
            sharedFiles: files.shared,
            watchTargetUuid: targetUuid,
        });
        return config;
    });
};
exports.withXcode = withXcode;
