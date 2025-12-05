"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBuildPhases = addBuildPhases;
const util_1 = __importDefault(require("util"));
function addBuildPhases(xcodeProject, { targetUuid, groupName, productFile, watchFiles, resourceFiles, }) {
    const buildPath = `"$(CONTENTS_FOLDER_PATH)/Watch"`;
    const folderType = 'watch2_app';
    // Sources build phase
    xcodeProject.addBuildPhase(watchFiles, 'PBXSourcesBuildPhase', groupName, targetUuid, folderType, buildPath);
    // Copy files build phase
    xcodeProject.addBuildPhase([], 'PBXCopyFilesBuildPhase', groupName, xcodeProject.getFirstTarget().uuid, folderType, buildPath);
    xcodeProject
        .buildPhaseObject('PBXCopyFilesBuildPhase', groupName, productFile.target)
        .files.push({
        value: productFile.uuid,
        comment: util_1.default.format('%s in %s', productFile.basename, productFile.group),
    });
    xcodeProject.addToPbxBuildFileSection(productFile);
    // Frameworks build phase
    xcodeProject.addBuildPhase([], 'PBXFrameworksBuildPhase', groupName, targetUuid, folderType, buildPath);
    // Resources build phase
    xcodeProject.addBuildPhase(resourceFiles, 'PBXResourcesBuildPhase', groupName, targetUuid, folderType, buildPath);
}
