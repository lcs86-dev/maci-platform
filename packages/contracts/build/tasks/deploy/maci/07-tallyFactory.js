"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maci_contracts_1 = require("maci-contracts");
const constants_1 = require("../../helpers/constants");
const deployment = maci_contracts_1.Deployment.getInstance({ contractNames: constants_1.EContracts });
const storage = maci_contracts_1.ContractStorage.getInstance();
/**
 * Deploy step registration and task itself
 */
deployment.deployTask(constants_1.EDeploySteps.TallyFactory, "Deploy tally factory").then((task) => task.setAction(async ({ incremental }, hre) => {
    deployment.setHre(hre);
    deployment.setContractNames(constants_1.EContracts);
    const deployer = await deployment.getDeployer();
    const tallyFactoryContractAddress = storage.getAddress(constants_1.EContracts.TallyFactory, hre.network.name);
    if (incremental && tallyFactoryContractAddress) {
        // eslint-disable-next-line no-console
        console.log(`Skipping deployment of the ${constants_1.EContracts.TallyFactory} contract`);
        return;
    }
    const poseidonT3ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT3, hre.network.name);
    const poseidonT4ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT4, hre.network.name);
    const poseidonT5ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT5, hre.network.name);
    const poseidonT6ContractAddress = storage.mustGetAddress(constants_1.EContracts.PoseidonT6, hre.network.name);
    const linkedTallyFactoryContract = await hre.ethers.getContractFactory("contracts/maci/TallyFactory.sol:TallyFactory", {
        signer: deployer,
        libraries: {
            PoseidonT3: poseidonT3ContractAddress,
            PoseidonT4: poseidonT4ContractAddress,
            PoseidonT5: poseidonT5ContractAddress,
            PoseidonT6: poseidonT6ContractAddress,
        },
    });
    const tallyFactoryContract = await deployment.deployContractWithLinkedLibraries({
        contractFactory: linkedTallyFactoryContract,
    });
    await storage.register({
        id: constants_1.EContracts.TallyFactory,
        contract: tallyFactoryContract,
        args: [],
        network: hre.network.name,
    });
}));
