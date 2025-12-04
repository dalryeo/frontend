"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("expo/config-plugins");
const withXcode_1 = require("./xcode/withXcode");
const withWatchApp = (config) => {
    const deploymentTarget = '10.0';
    const displayName = config.name;
    const bundleIdentifier = config.ios?.bundleIdentifier;
    const targetName = `${displayName} Watch App`;
    console.log({
        deploymentTarget,
        displayName,
        bundleIdentifier,
        targetName,
    });
    config = (0, config_plugins_1.withPlugins)(config, [
        [
            withXcode_1.withXcode,
            {
                name: displayName,
                targetName,
                bundleIdentifier,
                deploymentTarget,
            },
        ],
    ]);
    return config;
};
exports.default = withWatchApp;
