"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
/**
 * Config Plugin for Workout
 * iOS 단독 운동에 필요한 권한과 기능들을 자동으로 추가처리하는 플러그인.
 */
const withIosRunning = (config) => {
    // Info.plist에 권한 설명 추가
    config = (0, config_plugins_1.withInfoPlist)(config, (config) => {
        config.modResults.NSHealthShareUsageDescription =
            config.modResults.NSHealthShareUsageDescription ||
            '달려 앱은 러닝 운동 데이터를 HealthKit에 저장하고 읽기 위해 건강 데이터 접근 권한이 필요합니다.';
        config.modResults.NSHealthUpdateUsageDescription =
            config.modResults.NSHealthUpdateUsageDescription ||
            '달려 앱은 러닝 운동 기록을 HealthKit에 저장하기 위해 건강 데이터 쓰기 권한이 필요합니다.';
        config.modResults.NSLocationWhenInUseUsageDescription =
            config.modResults.NSLocationWhenInUseUsageDescription ||
            '달려 앱은 러닝 중 거리와 경로를 추적하기 위해 위치 정보가 필요합니다.';
        // Background modes 추가
        if (!config.modResults.UIBackgroundModes) {
            config.modResults.UIBackgroundModes = [];
        }
        if (!config.modResults.UIBackgroundModes.includes('location')) {
            config.modResults.UIBackgroundModes.push('location');
        }
        if (!config.modResults.UIBackgroundModes.includes('processing')) {
            config.modResults.UIBackgroundModes.push('processing');
        }
        return config;
    });
    // Entitlements에 HealthKit 추가
    config = (0, config_plugins_1.withEntitlementsPlist)(config, (config) => {
        config.modResults['com.apple.developer.healthkit'] = true;
        config.modResults['com.apple.developer.healthkit.access'] = [];
        return config;
    });
    return config;
};
exports.default = withIosRunning;
