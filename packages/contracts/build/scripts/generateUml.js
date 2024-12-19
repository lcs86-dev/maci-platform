"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FLATTEN_PATH = path_1.default.resolve(__dirname, "../build/flatten.sol");
async function generateUml() {
    const { promisify } = await Promise.resolve().then(() => __importStar(require("util")));
    const execFile = promisify(child_process_1.default.execFile);
    await execFile("pnpm", [
        "exec",
        "hardhat",
        "flatten",
        "./contracts/registryManager/EASRegistryManager.sol",
        "./contracts/registry/EASRegistry.sol",
    ]).then(({ stdout }) => fs_1.default.promises.writeFile(FLATTEN_PATH, stdout));
    await execFile("pnpm", [
        "exec",
        "sol2uml",
        "class",
        FLATTEN_PATH,
        "-o",
        path_1.default.resolve(__dirname, "../docs/diagram.svg"),
    ]).then(() => fs_1.default.promises.rm(FLATTEN_PATH));
}
generateUml();
