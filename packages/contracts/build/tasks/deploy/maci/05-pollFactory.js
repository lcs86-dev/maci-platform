"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maci_contracts_1 = require("maci-contracts");
const constants_1 = require("../../helpers/constants");
const deployment = maci_contracts_1.Deployment.getInstance({ contractNames: constants_1.EContracts });
const storage = maci_contracts_1.ContractStorage.getInstance();
/**
 * Deploy step registration and task itself
 */
deployment.deployTask(constants_1.EDeploySteps.PollFactory, "Deploy poll factory").then((task) => task.setAction(async ({ incremental }, hre) => {
    deployment.setHre(hre);
    deployment.setContractNames(constants_1.EContracts);
    const deployer = await deployment.getDeployer();
    const pollFactoryContractAddress = storage.getAddress(constants_1.EContracts.PollFactory, hre.network.name);
    if (incremental && pollFactoryContractAddress) {
        return;
    }
    const poseidonT3ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT3, hre.network.name);
    const poseidonT4ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT4, hre.network.name);
    const poseidonT5ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT5, hre.network.name);
    const poseidonT6ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT6, hre.network.name);
    const linkedPollFactoryContract = await hre.ethers.getContractFactory("contracts/maci/PollFactory.sol:PollFactory", {
        signer: deployer,
        libraries: {
            PoseidonT3: poseidonT3ContractAddress,
            PoseidonT4: poseidonT4ContractAddress,
            PoseidonT5: poseidonT5ContractAddress,
            PoseidonT6: poseidonT6ContractAddress,
        },
    });
    const pollFactoryContract = await deployment.deployContractWithLinkedLibraries({
        contractFactory: linkedPollFactoryContract,
    });
    await storage.register({
        id: constants_1.EContracts.PollFactory,
        contract: pollFactoryContract,
        args: [],
        network: hre.network.name,
    });
}));
