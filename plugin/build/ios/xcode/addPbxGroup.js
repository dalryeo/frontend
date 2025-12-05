"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPbxGroup = addPbxGroup;
function addPbxGroup(xcodeProject, { targetName }) {
    // 그룹 생성 시 entitlements, Info.plist도 포함
    const { uuid: pbxGroupUuid } = xcodeProject.addPbxGroup([
        'Assets.xcassets',
        'ContentView.swift',
        'ControlsView.swift',
        'DalryeoWatchApp.swift',
        'MetricsView.swift',
        'WorkoutManager.swift',
        'dalryeo Watch App.entitlements',
        'dalryeo-Watch-App-Info.plist',
    ], `"${targetName}"`, `"../${targetName}"`);
    const groups = xcodeProject.hash.project.objects['PBXGroup'];
    if (pbxGroupUuid) {
        Object.keys(groups).forEach(function (key) {
            if (groups[key].name === undefined && groups[key].path === undefined) {
                xcodeProject.addToPbxGroup(pbxGroupUuid, key);
            }
        });
    }
}
