"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPbxGroup = addPbxGroup;
function addPbxGroup(xcodeProject, { targetName, watchFiles, resourceFiles }) {
    const entitlementsFile = `${targetName}.entitlements`;
    const infoPlistFile = `${targetName.replace(/ /g, '-')}-Info.plist`;
    const allFiles = [
        ...resourceFiles,
        ...watchFiles,
        entitlementsFile,
        infoPlistFile,
    ];
    const { uuid: pbxGroupUuid } = xcodeProject.addPbxGroup(allFiles, `"${targetName}"`, `"../${targetName}"`);
    const groups = xcodeProject.hash.project.objects['PBXGroup'];
    if (pbxGroupUuid) {
        Object.keys(groups).forEach(function (key) {
            if (groups[key].name === undefined && groups[key].path === undefined) {
                xcodeProject.addToPbxGroup(pbxGroupUuid, key);
            }
        });
    }
}
