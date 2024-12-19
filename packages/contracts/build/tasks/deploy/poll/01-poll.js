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
const maci_contracts_1 = require("maci-contracts");
const maci_domainobjs_1 = require("maci-domainobjs");
const constants_1 = require("../../helpers/constants");
const deployment = maci_contracts_1.Deployment.getInstance({ contractNames: constants_1.EContracts });
const storage = maci_contracts_1.ContractStorage.getInstance();
/**
 * Deploy step registration and task itself
 */
deployment.deployTask(constants_1.EDeploySteps.Poll, "Deploy poll").then((task) => task.setAction(async (_, hre) => {
    deployment.setHre(hre);
    deployment.setContractNames(constants_1.EContracts);
    const maciContractAddress = storage.getAddress(constants_1.EContracts.MACI, hre.network.name);
    const verifierContractAddress = storage.getAddress(constants_1.EContracts.Verifier, hre.network.name);
    const vkRegistryContractAddress = storage.getAddress(constants_1.EContracts.VkRegistry, hre.network.name);
    if (!maciContractAddress) {
        throw new Error("Need to deploy MACI contract first");
    }
    if (!verifierContractAddress) {
        throw new Error("Need to deploy Verifier contract first");
    }
    if (!vkRegistryContractAddress) {
        throw new Error("Need to deploy VkRegistry contract first");
    }
    const { MACI__factory: MACIFactory, Poll__factory: PollFactory, Tally__factory: TallyFactory, } = await Promise.resolve().then(() => __importStar(require("../../../typechain-types")));
    const maciContract = await deployment.getContract({ name: constants_1.EContracts.MACI, abi: MACIFactory.abi });
    const pollId = await maciContract.nextPollId();
    const deployerAddress = await deployment.getDeployer().then((deployer) => deployer.getAddress());
    const coordinatorPubkey = deployment.getDeployConfigField(constants_1.EContracts.Poll, "coordinatorPubkey");
    const pollDuration = deployment.getDeployConfigField(constants_1.EContracts.Poll, "pollDuration");
    const intStateTreeDepth = deployment.getDeployConfigField(constants_1.EContracts.VkRegistry, "intStateTreeDepth");
    const messageTreeSubDepth = deployment.getDeployConfigField(constants_1.EContracts.VkRegistry, "messageBatchDepth");
    const messageTreeDepth = deployment.getDeployConfigField(constants_1.EContracts.VkRegistry, "messageTreeDepth");
    const voteOptionTreeDepth = deployment.getDeployConfigField(constants_1.EContracts.VkRegistry, "voteOptionTreeDepth");
    const useQuadraticVoting = deployment.getDeployConfigField(constants_1.EContracts.Poll, "useQuadraticVoting") ?? false;
    const unserializedKey = maci_domainobjs_1.PubKey.deserialize(coordinatorPubkey);
    const mode = useQuadraticVoting ? maci_contracts_1.EMode.QV : maci_contracts_1.EMode.NON_QV;
    const registryManagerType = deployment.getDeployConfigField(constants_1.EContracts.MACI, "registryManager") ||
        constants_1.EContracts.EASRegistryManager;
    const registryManagerAddress = storage.getAddress(registryManagerType, hre.network.name);
    const registryType = deployment.getDeployConfigField(constants_1.EContracts.MACI, "registry") || constants_1.EContracts.EASRegistry;
    const maxRecipients = deployment.getDeployConfigField(registryType, "maxRecipients");
    const metadataUrl = deployment.getDeployConfigField(registryType, "metadataUrl");
    const easAddress = deployment.getDeployConfigField(registryType, "easAddress");
    const registryArgs = registryType === constants_1.EContracts.EASRegistry
        ? [maxRecipients, metadataUrl, easAddress, registryManagerAddress]
        : [maxRecipients, metadataUrl, registryManagerAddress];
    const pollRegistry = await deployment.deployContract({ name: constants_1.REGISTRY_TYPES[registryManagerType] }, ...registryArgs);
    const deployPollReceipt = await maciContract
        .deployPoll(pollDuration, {
        intStateTreeDepth,
        messageTreeSubDepth,
        messageTreeDepth,
        voteOptionTreeDepth,
    }, unserializedKey.asContractParam(), verifierContractAddress, vkRegistryContractAddress, mode)
        .then((tx) => tx.wait());
    if (deployPollReceipt?.status !== 1) {
        throw new Error("Deploy poll transaction is failed");
    }
    const pollContracts = await maciContract.getPoll(pollId);
    const pollContractAddress = pollContracts.poll;
    const messageProcessorContractAddress = pollContracts.messageProcessor;
    const tallyContractAddress = pollContracts.tally;
    const pollContract = await deployment.getContract({
        name: constants_1.EContracts.Poll,
        abi: PollFactory.abi,
        address: pollContractAddress,
    });
    const extContracts = await pollContract.extContracts();
    await maciContract
        .setPollRegistry(pollId, await pollRegistry.getAddress())
        .then((transaction) => transaction.wait());
    const messageProcessorContract = await deployment.getContract({
        name: constants_1.EContracts.MessageProcessor,
        address: messageProcessorContractAddress,
    });
    const tallyContract = await deployment.getContract({
        name: constants_1.EContracts.Tally,
        abi: TallyFactory.abi,
        address: tallyContractAddress,
    });
    const messageAccQueueContract = await deployment.getContract({
        name: constants_1.EContracts.AccQueueQuinaryMaci,
        address: extContracts[1],
    });
    // get the empty ballot root
    const emptyBallotRoot = await pollContract.emptyBallotRoot();
    const cooldownTime = deployment.getDeployConfigField(constants_1.EContracts.Tally, "cooldownTime") ?? constants_1.ONE_WEEK_IN_SECONDS * 8;
    const maxContribution = deployment.getDeployConfigField(constants_1.EContracts.Tally, "maxContribution", true);
    const maxCap = deployment.getDeployConfigField(constants_1.EContracts.Tally, "maxCap", true);
    const withPause = deployment.getDeployConfigField(constants_1.EContracts.Tally, "withPause") ?? true;
    let payoutToken = deployment.getDeployConfigField(constants_1.EContracts.Tally, "payoutToken", true);
    if (hre.network.name === "localhost") {
        const mockERC20 = await deployment.deployContract({ name: constants_1.EContracts.MockERC20, abi: maci_contracts_1.MockERC20__factory.abi }, "Token", "TEST");
        payoutToken = await mockERC20.getAddress();
        await storage.register({
            id: constants_1.EContracts.MockERC20,
            key: `poll-${pollId}`,
            contract: mockERC20,
            args: ["Token", "TEST"],
            network: hre.network.name,
        });
    }
    if (payoutToken === ethers_1.ZeroAddress) {
        throw new Error("Payout token is a zero address");
    }
    await tallyContract
        .init({
        cooldownTime,
        maxContribution,
        payoutToken,
        maxCap,
    })
        .then((tx) => tx.wait());
    // Need to pause deposits/withdrawals/claims for now
    // When feature is ready, this code can be removed
    if (withPause) {
        await tallyContract.pause().then((tx) => tx.wait());
    }
    await Promise.all([
        storage.register({
            id: constants_1.EContracts.Poll,
            name: "contracts/maci/Poll.sol:Poll",
            key: `poll-${pollId}`,
            contract: pollContract,
            args: [
                pollDuration,
                {
                    intStateTreeDepth,
                    messageTreeSubDepth,
                    messageTreeDepth,
                    voteOptionTreeDepth,
                },
                unserializedKey.asContractParam(),
                extContracts,
                emptyBallotRoot.toString(),
            ],
            network: hre.network.name,
        }),
        storage.register({
            id: constants_1.REGISTRY_TYPES[registryManagerType],
            key: `poll-${pollId}`,
            contract: pollRegistry,
            args: registryArgs,
            network: hre.network.name,
        }),
        storage.register({
            id: constants_1.EContracts.MessageProcessor,
            key: `poll-${pollId}`,
            contract: messageProcessorContract,
            args: [verifierContractAddress, vkRegistryContractAddress, pollContractAddress, deployerAddress, mode],
            network: hre.network.name,
        }),
        storage.register({
            id: constants_1.EContracts.Tally,
            key: `poll-${pollId}`,
            name: "contracts/maci/Tally.sol:Tally",
            contract: tallyContract,
            args: [
                verifierContractAddress,
                vkRegistryContractAddress,
                pollContractAddress,
                messageProcessorContractAddress,
                deployerAddress,
                mode,
            ],
            network: hre.network.name,
        }),
        storage.register({
            id: constants_1.EContracts.AccQueueQuinaryMaci,
            key: `poll-${pollId}`,
            name: "maci-contracts/contracts/trees/AccQueueQuinaryMaci.sol:AccQueueQuinaryMaci",
            contract: messageAccQueueContract,
            args: [messageTreeSubDepth],
            network: hre.network.name,
        }),
    ]);
}));
