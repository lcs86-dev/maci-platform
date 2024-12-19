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
const maci_contracts_1 = require("maci-contracts");
const constants_1 = require("../../helpers/constants");
const deployment = maci_contracts_1.Deployment.getInstance({ contractNames: constants_1.EContracts });
const storage = maci_contracts_1.ContractStorage.getInstance();
/**
 * Deploy step registration and task itself
 */
deployment.deployTask(constants_1.EDeploySteps.RegistryManager, "Deploy registry manager").then((task) => task.setAction(async ({ incremental }, hre) => {
    deployment.setHre(hre);
    deployment.setContractNames(constants_1.EContracts);
    const deployer = await deployment.getDeployer();
    const registryManagerType = deployment.getDeployConfigField(constants_1.EContracts.MACI, "registryManager") ||
        constants_1.EContracts.EASRegistryManager;
    const registryManagerContractAddress = storage.getAddress(registryManagerType, hre.network.name);
    if (incremental && registryManagerContractAddress) {
        return;
    }
    const easAddress = deployment.getDeployConfigField(registryManagerType, "easAddress");
    const args = easAddress ? [easAddress] : [];
    const registryManagerContract = await deployment.deployContract({
        name: registryManagerType,
        signer: deployer,
    }, ...args);
    const maciContractAddress = storage.mustGetAddress(constants_1.EContracts.MACI, hre.network.name);
    const { MACI__factory: MACIFactory } = await Promise.resolve().then(() => __importStar(require("../../../typechain-types")));
    const maciContract = await deployment.getContract({
        name: constants_1.EContracts.MACI,
        abi: MACIFactory.abi,
        address: maciContractAddress,
    });
    const contractAddress = await registryManagerContract.getAddress();
    await maciContract.setRegistryManager(contractAddress).then((tx) => tx.wait());
    await storage.register({
        id: registryManagerType,
        contract: registryManagerContract,
        args,
        network: hre.network.name,
    });
}));
