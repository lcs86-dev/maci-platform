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
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const config_1 = require("hardhat/config");
const maci_contracts_1 = require("maci-contracts");
const maci_domainobjs_1 = require("maci-domainobjs");
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("../helpers/constants");
/**
 * Prove hardhat task for generating off-chain proofs and sending them on-chain
 */
(0, config_1.task)("prove", "Command to generate proofs")
    .addParam("poll", "The poll id", undefined, config_1.types.string)
    .addParam("outputDir", "Output directory for proofs", undefined, config_1.types.string)
    .addParam("coordinatorPrivateKey", "Coordinator maci private key", undefined, config_1.types.string)
    .addOptionalParam("rapidsnark", "Rapidsnark binary path", undefined, config_1.types.string)
    .addOptionalParam("processWitgen", "Process witgen binary path", undefined, config_1.types.string)
    .addParam("tallyFile", "The file to store the tally proof", undefined, config_1.types.string)
    .addOptionalParam("tallyWitgen", "Tally witgen binary path", undefined, config_1.types.string)
    .addOptionalParam("stateFile", "The file with the serialized maci state", undefined, config_1.types.string)
    .addOptionalParam("startBlock", "The block number to start fetching logs from", undefined, config_1.types.int)
    .addOptionalParam("blocksPerBatch", "The number of blocks to fetch logs from", undefined, config_1.types.int)
    .addOptionalParam("endBlock", "The block number to stop fetching logs from", undefined, config_1.types.int)
    .addOptionalParam("transactionHash", "The transaction hash of the first transaction", undefined, config_1.types.int)
    .setAction(async ({ outputDir, poll, coordinatorPrivateKey, stateFile, rapidsnark, processWitgen, tallyWitgen, tallyFile, startBlock, blocksPerBatch, endBlock, transactionHash, }, hre) => {
    const deployment = maci_contracts_1.Deployment.getInstance();
    deployment.setHre(hre);
    deployment.setContractNames(constants_1.EContracts);
    const storage = maci_contracts_1.ContractStorage.getInstance();
    // if we do not have the output directory just create it
    const isOutputDirExists = fs_1.default.existsSync(outputDir);
    if (!isOutputDirExists) {
        // Create the directory
        await fs_1.default.promises.mkdir(outputDir);
    }
    const maciPrivateKey = maci_domainobjs_1.PrivKey.deserialize(coordinatorPrivateKey);
    const coordinatorKeypair = new maci_domainobjs_1.Keypair(maciPrivateKey);
    const signer = await deployment.getDeployer();
    const { network } = hre;
    const startBalance = await signer.provider.getBalance(signer);
    console.log("Start balance: ", Number(startBalance / 10n ** 12n) / 1e6);
    const { MACI__factory: MACIFactory, Poll__factory: PollFactory } = await Promise.resolve().then(() => __importStar(require("../../typechain-types")));
    const maciContractAddress = storage.mustGetAddress(constants_1.EContracts.MACI, network.name);
    const maciContract = await deployment.getContract({
        name: constants_1.EContracts.MACI,
        address: maciContractAddress,
        abi: MACIFactory.abi,
    });
    const pollContracts = await maciContract.polls(poll);
    const pollContract = await deployment.getContract({
        name: constants_1.EContracts.Poll,
        address: pollContracts.poll,
        abi: PollFactory.abi,
    });
    const messageAqAddress = await pollContract.extContracts().then((contracts) => contracts.messageAq);
    const messageAq = await deployment.getContract({
        name: constants_1.EContracts.AccQueue,
        address: messageAqAddress,
    });
    const [, messageAqContractAddress] = await pollContract.extContracts();
    const messageAqContract = await deployment.getContract({
        name: constants_1.EContracts.AccQueue,
        address: messageAqContractAddress,
    });
    const isStateAqMerged = await pollContract.stateMerged();
    // Check that the state and message trees have been merged for at least the first poll
    if (!isStateAqMerged && poll.toString() === "0") {
        throw new Error("The state tree has not been merged yet. Please use the mergeSignups subcommand to do so.");
    }
    const messageTreeDepth = await pollContract.treeDepths().then((depths) => Number(depths[2]));
    // check that the main root is set
    const mainRoot = await messageAqContract.getMainRoot(messageTreeDepth.toString());
    if (mainRoot.toString() === "0") {
        throw new Error("The message tree has not been merged yet. Please use the mergeMessages subcommand to do so.");
    }
    console.log("prepareState", {
        maciContract,
        pollContract,
        messageAq,
        maciPrivateKey,
        coordinatorKeypair,
        pollId: poll,
        signer,
        outputDir,
        options: {
            stateFile,
            transactionHash,
            startBlock,
            endBlock,
            blocksPerBatch: 10,
        },
    });
    const maciState = await maci_contracts_1.ProofGenerator.prepareState({
        maciContract,
        pollContract,
        messageAq,
        maciPrivateKey,
        coordinatorKeypair,
        pollId: poll,
        signer,
        outputDir,
        options: {
            stateFile,
            transactionHash,
            startBlock,
            endBlock,
            blocksPerBatch: 10,
        },
    });
    console.log("after prepareState");
    const foundPoll = maciState.polls.get(BigInt(poll));
    if (!foundPoll) {
        throw new Error(`Poll ${poll} not found`);
    }
    const useQuadraticVoting = deployment.getDeployConfigField(constants_1.EContracts.Poll, "useQuadraticVoting") ?? false;
    const mode = useQuadraticVoting ? "qv" : "nonQv";
    const tallyZkey = deployment.getDeployConfigField(constants_1.EContracts.VkRegistry, `zkeys.${mode}.tallyVotesZkey`, true);
    const tallyWasm = deployment.getDeployConfigField(constants_1.EContracts.VkRegistry, `zkeys.${mode}.tallyWasm`, true);
    const processZkey = deployment.getDeployConfigField(constants_1.EContracts.VkRegistry, `zkeys.${mode}.processMessagesZkey`, true);
    const processWasm = deployment.getDeployConfigField(constants_1.EContracts.VkRegistry, `zkeys.${mode}.processWasm`, true);
    const proofGenerator = new maci_contracts_1.ProofGenerator({
        poll: foundPoll,
        maciContractAddress,
        tallyContractAddress: pollContracts.tally,
        rapidsnark,
        tally: {
            zkey: tallyZkey,
            witgen: tallyWitgen,
            wasm: tallyWasm,
        },
        mp: {
            zkey: processZkey,
            witgen: processWitgen,
            wasm: processWasm,
        },
        outputDir,
        tallyOutputFile: tallyFile,
        useQuadraticVoting,
    });
    await proofGenerator.generateMpProofs();
    console.log("after generateMpProofs");
    await proofGenerator.generateTallyProofs(network);
    console.log("after generateTallyProofs");
    const endBalance = await signer.provider.getBalance(signer);
    console.log("End balance: ", Number(endBalance / 10n ** 12n) / 1e6);
    console.log("Prove expenses: ", Number((startBalance - endBalance) / 10n ** 12n) / 1e6);
    console.log("Please make sure that you do not delete the proofs from the proof directory until they are all submitted on-chain.\nRegenerating proofs will result in overwriting the existing proofs and commitments which will be different due to the use of random salts.");
});
