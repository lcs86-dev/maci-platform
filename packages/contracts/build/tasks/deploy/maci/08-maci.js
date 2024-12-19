"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maci_contracts_1 = require("maci-contracts");
const constants_1 = require("../../helpers/constants");
const deployment = maci_contracts_1.Deployment.getInstance({ contractNames: constants_1.EContracts });
const storage = maci_contracts_1.ContractStorage.getInstance();
const DEFAULT_STATE_TREE_DEPTH = 10;
/**
 * Deploy step registration and task itself
 */
deployment.deployTask(constants_1.EDeploySteps.Maci, "Deploy MACI contract").then((task) => task.setAction(async ({ incremental }, hre) => {
    deployment.setHre(hre);
    deployment.setContractNames(constants_1.EContracts);
    const deployer = await deployment.getDeployer();
    const maciContractAddress = storage.getAddress(constants_1.EContracts.MACI, hre.network.name);
    if (incremental && maciContractAddress) {
        return;
    }
    const poseidonT3ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT3, hre.network.name);
    const poseidonT4ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT4, hre.network.name);
    const poseidonT5ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT5, hre.network.name);
    const poseidonT6ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT6, hre.network.name);
    const maciContractFactory = await hre.ethers.getContractFactory("contracts/maci/MACI.sol:MACI", {
        signer: deployer,
        libraries: {
            PoseidonT3: poseidonT3ContractAddress,
            PoseidonT4: poseidonT4ContractAddress,
            PoseidonT5: poseidonT5ContractAddress,
            PoseidonT6: poseidonT6ContractAddress,
        },
    });
    const constantInitialVoiceCreditProxyContractAddress = storage.mustGetAddress(constants_1.EContracts.ConstantInitialVoiceCreditProxy, hre.network.name);
    const gatekeeper = deployment.getDeployConfigField(constants_1.EContracts.MACI, "gatekeeper") ||
        constants_1.EContracts.FreeForAllGatekeeper;
    const gatekeeperContractAddress = storage.mustGetAddress(gatekeeper, hre.network.name);
    const pollFactoryContractAddress = storage.mustGetAddress(constants_1.EContracts.PollFactory, hre.network.name);
    const messageProcessorFactoryContractAddress = storage.mustGetAddress(constants_1.EContracts.MessageProcessorFactory, hre.network.name);
    const tallyFactoryContractAddress = storage.mustGetAddress(constants_1.EContracts.TallyFactory, hre.network.name);
    const stateTreeDepth = deployment.getDeployConfigField(constants_1.EContracts.MACI, "stateTreeDepth") ?? DEFAULT_STATE_TREE_DEPTH;
    const emptyBallotRoots = (0, maci_contracts_1.genEmptyBallotRoots)(stateTreeDepth);
    const maciContract = await deployment.deployContractWithLinkedLibraries({ contractFactory: maciContractFactory }, pollFactoryContractAddress, messageProcessorFactoryContractAddress, tallyFactoryContractAddress, gatekeeperContractAddress, constantInitialVoiceCreditProxyContractAddress, stateTreeDepth, emptyBallotRoots);
    if (gatekeeper === constants_1.EContracts.EASGatekeeper) {
        const gatekeeperContract = await deployment.getContract({
            name: constants_1.EContracts.EASGatekeeper,
            address: gatekeeperContractAddress,
        });
        const maciInstanceAddress = await maciContract.getAddress();
        await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    }
    else if (gatekeeper === constants_1.EContracts.GitcoinPassportGatekeeper) {
        const gatekeeperContract = await deployment.getContract({
            name: constants_1.EContracts.GitcoinPassportGatekeeper,
            address: gatekeeperContractAddress,
        });
        const maciInstanceAddress = await maciContract.getAddress();
        await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    }
    else if (gatekeeper === constants_1.EContracts.ZupassGatekeeper) {
        const gatekeeperContract = await deployment.getContract({
            name: constants_1.EContracts.ZupassGatekeeper,
            address: gatekeeperContractAddress,
        });
        const maciInstanceAddress = await maciContract.getAddress();
        await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    }
    else if (gatekeeper === constants_1.EContracts.SemaphoreGatekeeper) {
        const gatekeeperContract = await deployment.getContract({
            name: constants_1.EContracts.SemaphoreGatekeeper,
            address: gatekeeperContractAddress,
        });
        const maciInstanceAddress = await maciContract.getAddress();
        await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    }
    else if (gatekeeper === constants_1.EContracts.HatsGatekeeper) {
        const gatekeeperContract = await deployment.getContract({
            name: constants_1.EContracts.HatsGatekeeper,
            address: gatekeeperContractAddress,
        });
        const maciInstanceAddress = await maciContract.getAddress();
        await gatekeeperContract.setMaciInstance(maciInstanceAddress).then((tx) => tx.wait());
    }
    await storage.register({
        id: constants_1.EContracts.MACI,
        contract: maciContract,
        args: [
            pollFactoryContractAddress,
            messageProcessorFactoryContractAddress,
            tallyFactoryContractAddress,
            gatekeeperContractAddress,
            constantInitialVoiceCreditProxyContractAddress,
            stateTreeDepth,
            emptyBallotRoots.map((root) => root.toString()),
        ],
        network: hre.network.name,
    });
}));
