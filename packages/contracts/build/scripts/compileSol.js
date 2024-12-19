"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const circomlibjs_1 = require("circomlibjs");
const hardhat_1 = __importDefault(require("hardhat"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PATHS = [
    path_1.default.resolve(__dirname, "..", "artifacts"),
    path_1.default.resolve(__dirname, "..", "cache"),
    path_1.default.resolve(__dirname, "..", "typechain-types"),
];
const buildPoseidon = async (numInputs) => {
    await hardhat_1.default.overwriteArtifact(`PoseidonT${numInputs + 1}`, circomlibjs_1.poseidonContract.createCode(numInputs));
};
const buildPoseidonT3 = () => buildPoseidon(2);
const buildPoseidonT4 = () => buildPoseidon(3);
const buildPoseidonT5 = () => buildPoseidon(4);
const buildPoseidonT6 = () => buildPoseidon(5);
async function main() {
    await Promise.all(PATHS.map((filepath) => fs_1.default.existsSync(filepath) && fs_1.default.promises.rm(filepath, { recursive: true })));
    await hardhat_1.default.run("compile");
    await Promise.all([buildPoseidonT3(), buildPoseidonT4(), buildPoseidonT5(), buildPoseidonT6()]);
}
main();
