"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const withIosRunning_1 = __importDefault(require("../ios/withIosRunning"));
const withWatchRunning_1 = __importDefault(require("../ios/withWatchRunning"));
const types_1 = require("../ios/xcode/types");
const withAppleRunning = (config) => {
    config = (0, withIosRunning_1.default)(config);
    config = (0, withWatchRunning_1.default)(config, {
        deploymentTarget: '10.0',
        files: types_1.DEFAULT_FILES,
    });
    return config;
};
exports.default = withAppleRunning;
