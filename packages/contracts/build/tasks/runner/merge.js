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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const ethers_1 = require("ethers");
const config_1 = require("hardhat/config");
const maci_contracts_1 = require("maci-contracts");
const constants_1 = require("../helpers/constants");
const DEFAULT_SR_QUEUE_OPS = 4;
/**
 * Command to merge signup and message queues of a MACI contract
 */
(0, config_1.task)("merge", "Merge signups and messages")
    .addParam("poll", "The poll id", undefined, config_1.types.string)
    .addOptionalParam("queueOps", "The number of queue operations to perform", DEFAULT_SR_QUEUE_OPS, config_1.types.int)
    .addOptionalParam("prove", "Run prove command after merging", false, config_1.types.boolean)
    .setAction(async ({ poll, prove, queueOps = DEFAULT_SR_QUEUE_OPS }, hre) => {
    const deployment = maci_contracts_1.Deployment.getInstance({ hre });
    deployment.setHre(hre);
    deployment.setContractNames(constants_1.EContracts);
    const deployer = await deployment.getDeployer();
    const { MACI__factory: MACIFactory, Poll__factory: PollFactory } = await Promise.resolve().then(() => __importStar(require("../../typechain-types")));
    const maciContract = await deployment.getContract({
        name: constants_1.EContracts.MACI,
        abi: MACIFactory.abi,
    });
    const pollContracts = await maciContract.polls(poll);
    const pollContract = await deployment.getContract({
        name: constants_1.EContracts.Poll,
        abi: PollFactory.abi,
        address: pollContracts.poll,
    });
    const [, messageAccQueueContractAddress] = await pollContract.extContracts();
    const messageAccQueueContract = await deployment.getContract({
        name: constants_1.EContracts.AccQueue,
        address: messageAccQueueContractAddress,
    });
    if (pollContracts.poll === ethers_1.ZeroAddress) {
        throw new Error(`No poll ${poll} found`);
    }
    const treeMerger = new maci_contracts_1.TreeMerger({
        deployer,
        pollContract,
        messageAccQueueContract,
    });
    const startBalance = await deployer.provider.getBalance(deployer);
    console.log("Start balance: ", Number(startBalance / 10n ** 12n) / 1e6);
    await treeMerger.checkPollDuration();
    await treeMerger.mergeSignups();
    await treeMerger.mergeMessageSubtrees(queueOps);
    await treeMerger.mergeMessages();
    const endBalance = await deployer.provider.getBalance(deployer);
    console.log("End balance: ", Number(endBalance / 10n ** 12n) / 1e6);
    console.log("Merge expenses: ", Number((startBalance - endBalance) / 10n ** 12n) / 1e6);
    if (prove) {
        console.log(`Prove poll ${poll} results`);
        await hre.run("prove");
    }
});
