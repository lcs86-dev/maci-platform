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
const fs_1 = __importDefault(require("fs"));
const constants_1 = require("../helpers/constants");
/**
 * Read and parse proofs
 *
 * @param args - read proofs arguments
 * @returns proofs
 */
async function readProofs({ files, folder, type }) {
    return Promise.all(files
        .filter((f) => f.startsWith(`${type}_`) && f.endsWith(".json"))
        .sort()
        .map(async (file) => fs_1.default.promises.readFile(`${folder}/${file}`, "utf8").then((result) => JSON.parse(result))));
}
/**
 * Prove hardhat task for submitting proofs on-chain as well as uploading tally results
 */
(0, config_1.task)("submitOnChain", "Command to prove the result of a poll on-chain")
    .addParam("poll", "The poll id", undefined, config_1.types.string)
    .addParam("outputDir", "Output directory for proofs", undefined, config_1.types.string)
    .addParam("tallyFile", "The file to store the tally proof", undefined, config_1.types.string)
    .setAction(async ({ outputDir, poll, tallyFile }, hre) => {
    const deployment = maci_contracts_1.Deployment.getInstance();
    deployment.setHre(hre);
    deployment.setContractNames(constants_1.EContracts);
    const storage = maci_contracts_1.ContractStorage.getInstance();
    // if we do not have the output directory just create it
    const isOutputDirExists = fs_1.default.existsSync(outputDir);
    if (!isOutputDirExists) {
        // Create the directory
        throw new Error(`Output directory ${outputDir} does not exist. You must provide a valid directory containing the poll zk-SNARK proofs.`);
    }
    const signer = await deployment.getDeployer();
    const { network } = hre;
    const startBalance = await signer.provider.getBalance(signer);
    console.log("Start balance: ", Number(startBalance / 10n ** 12n) / 1e6);
    const { MACI__factory: MACIFactory, Poll__factory: PollFactory, Tally__factory: TallyFactory, SimpleRegistry__factory: SimpleRegistryFactory, } = await Promise.resolve().then(() => __importStar(require("../../typechain-types")));
    const maciContractAddress = storage.mustGetAddress(constants_1.EContracts.MACI, network.name);
    const [maciContract, vkRegistryContract, verifierContract] = await Promise.all([
        deployment.getContract({
            name: constants_1.EContracts.MACI,
            address: maciContractAddress,
            abi: MACIFactory.abi,
        }),
        deployment.getContract({ name: constants_1.EContracts.VkRegistry }),
        deployment.getContract({ name: constants_1.EContracts.Verifier }),
    ]);
    const pollContracts = await maciContract.polls(poll);
    const pollContract = await deployment.getContract({
        name: constants_1.EContracts.Poll,
        address: pollContracts.poll,
        abi: PollFactory.abi,
    });
    const [[, messageAqContractAddress], isStateAqMerged, messageTreeDepth, mpContract, tallyContract] = await Promise.all([
        pollContract.extContracts(),
        pollContract.stateMerged(),
        pollContract.treeDepths().then((depths) => Number(depths[2])),
        deployment.getContract({
            name: constants_1.EContracts.MessageProcessor,
            address: pollContracts.messageProcessor,
        }),
        deployment.getContract({
            name: constants_1.EContracts.Tally,
            address: pollContracts.tally,
            abi: TallyFactory.abi,
        }),
    ]);
    const messageAqContract = await deployment.getContract({
        name: constants_1.EContracts.AccQueue,
        address: messageAqContractAddress,
    });
    // Check that the state and message trees have been merged for at least the first poll
    if (!isStateAqMerged && poll.toString() === "0") {
        throw new Error("The state tree has not been merged yet. Please use the mergeSignups subcommand to do so.");
    }
    // check that the main root is set
    const mainRoot = await messageAqContract.getMainRoot(messageTreeDepth.toString());
    if (mainRoot.toString() === "0") {
        throw new Error("The message tree has not been merged yet. Please use the mergeMessages subcommand to do so.");
    }
    const data = {
        processProofs: [],
        tallyProofs: [],
    };
    // read the proofs from the output directory
    const files = await fs_1.default.promises.readdir(outputDir);
    // Read process proofs
    data.processProofs = await readProofs({ files, folder: outputDir, type: "process" });
    // Read tally proofs
    data.tallyProofs = await readProofs({ files, folder: outputDir, type: "tally" });
    const prover = new maci_contracts_1.Prover({
        maciContract,
        messageAqContract,
        mpContract,
        pollContract,
        vkRegistryContract,
        verifierContract,
        tallyContract,
    });
    await prover.proveMessageProcessing(data.processProofs);
    // read tally data
    const tallyData = await fs_1.default.promises
        .readFile(tallyFile, "utf8")
        .then((result) => JSON.parse(result));
    await prover.proveTally(data.tallyProofs);
    // submit the results with number participants to be taken from the registry
    const registryContractAddress = await pollContract.getRegistry();
    const registryContract = SimpleRegistryFactory.connect(registryContractAddress, signer);
    const recipientCount = await registryContract.recipientCount();
    await prover.submitResults(tallyData, Number.parseInt(recipientCount.toString(), 10));
    const endBalance = await signer.provider.getBalance(signer);
    console.log("End balance: ", Number(endBalance / 10n ** 12n) / 1e6);
    console.log("Prove expenses: ", Number((startBalance - endBalance) / 10n ** 12n) / 1e6);
});
