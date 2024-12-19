"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONE_WEEK_IN_SECONDS = exports.getEtherscanApiKeys = exports.getNetworkRpcUrls = exports.EChainId = exports.ESupportedChains = exports.REGISTRY_TYPES = exports.EContracts = exports.EPlatformContracts = exports.EDeploySteps = exports.EPlatformDeployStep = void 0;
const maci_contracts_1 = require("maci-contracts");
/**
 * Deploy steps for maci-platform related constacts
 */
var EPlatformDeployStep;
(function (EPlatformDeployStep) {
    EPlatformDeployStep["RegistryManager"] = "full:deploy-registry-manager";
})(EPlatformDeployStep || (exports.EPlatformDeployStep = EPlatformDeployStep = {}));
/**
 * Deploy steps for maci and maci-platform
 */
exports.EDeploySteps = {
    ...maci_contracts_1.EDeploySteps,
    ...EPlatformDeployStep,
};
/**
 * Contracts for maci-platform related constacts
 */
var EPlatformContracts;
(function (EPlatformContracts) {
    EPlatformContracts["EASRegistryManager"] = "EASRegistryManager";
    EPlatformContracts["RegistryManager"] = "RegistryManager";
    EPlatformContracts["EASRegistry"] = "EASRegistry";
    EPlatformContracts["SimpleRegistry"] = "SimpleRegistry";
    EPlatformContracts["MockERC20"] = "MockERC20";
})(EPlatformContracts || (exports.EPlatformContracts = EPlatformContracts = {}));
/**
 * Contracts for maci and maci-platform
 */
exports.EContracts = {
    ...maci_contracts_1.EContracts,
    ...EPlatformContracts,
};
/**
 * Registry types by registry manager
 */
exports.REGISTRY_TYPES = {
    [EPlatformContracts.EASRegistryManager]: EPlatformContracts.EASRegistry,
    [EPlatformContracts.RegistryManager]: EPlatformContracts.SimpleRegistry,
};
/**
 * Supported networks for deployment and task running
 */
var ESupportedChains;
(function (ESupportedChains) {
    ESupportedChains["Sepolia"] = "sepolia";
    ESupportedChains["Optimism"] = "optimism";
    ESupportedChains["OptimismSepolia"] = "optimism_sepolia";
    ESupportedChains["Scroll"] = "scroll";
    ESupportedChains["ScrollSepolia"] = "scroll_sepolia";
    ESupportedChains["Arbitrum"] = "arbitrum";
    ESupportedChains["ArbitrumSepolia"] = "arbitrum_sepolia";
    ESupportedChains["Base"] = "base";
    ESupportedChains["BaseSepolia"] = "base_sepolia";
    ESupportedChains["Coverage"] = "coverage";
    ESupportedChains["Hardhat"] = "hardhat";
    ESupportedChains["Saigon"] = "saigon";
})(ESupportedChains || (exports.ESupportedChains = ESupportedChains = {}));
/**
 * Supported network chain ids for deployment and task running
 */
var EChainId;
(function (EChainId) {
    EChainId[EChainId["Hardhat"] = 31337] = "Hardhat";
    EChainId[EChainId["Optimism"] = 10] = "Optimism";
    EChainId[EChainId["OptimismSepolia"] = 11155420] = "OptimismSepolia";
    EChainId[EChainId["Sepolia"] = 11155111] = "Sepolia";
    EChainId[EChainId["Scroll"] = 534352] = "Scroll";
    EChainId[EChainId["ScrollSepolia"] = 534351] = "ScrollSepolia";
    EChainId[EChainId["Arbitrum"] = 42161] = "Arbitrum";
    EChainId[EChainId["ArbitrumSepolia"] = 421614] = "ArbitrumSepolia";
    EChainId[EChainId["Base"] = 8453] = "Base";
    EChainId[EChainId["BaseSepolia"] = 84532] = "BaseSepolia";
    EChainId[EChainId["Coverage"] = 1337] = "Coverage";
    EChainId[EChainId["Saigon"] = 2021] = "Saigon";
})(EChainId || (exports.EChainId = EChainId = {}));
/**
 * Get network rpc urls object
 *
 * @returns {Record<ESupportedChains, string>} rpc urls for supported networks
 */
const getNetworkRpcUrls = () => {
    const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL ?? "";
    const OP_RPC_URL = process.env.OP_RPC_URL ?? "";
    const OP_SEPOLIA_RPC_URL = process.env.OP_SEPOLIA_RPC_URL ?? "";
    const SCROLL_RPC_URL = process.env.SCROLL_RPC_URL ?? "";
    const SCROLL_SEPOLIA_RPC_URL = process.env.SCROLL_SEPOLIA_RPC_URL ?? "";
    const ARB_RPC_URL = process.env.ARB_RPC_URL ?? "";
    const ARB_SEPOLIA_RPC_URL = process.env.ARB_SEPOLIA_RPC_URL ?? "";
    const BASE_RPC_URL = process.env.BASE_RPC_URL ?? "";
    const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL ?? "";
    const SAIGON_RPC_URL = process.env.SAIGON_RPC_URL ?? "";
    return {
        [ESupportedChains.Sepolia]: SEPOLIA_RPC_URL,
        [ESupportedChains.Optimism]: OP_RPC_URL,
        [ESupportedChains.OptimismSepolia]: OP_SEPOLIA_RPC_URL,
        [ESupportedChains.Scroll]: SCROLL_RPC_URL,
        [ESupportedChains.ScrollSepolia]: SCROLL_SEPOLIA_RPC_URL,
        [ESupportedChains.Arbitrum]: ARB_RPC_URL,
        [ESupportedChains.ArbitrumSepolia]: ARB_SEPOLIA_RPC_URL,
        [ESupportedChains.Base]: BASE_RPC_URL,
        [ESupportedChains.BaseSepolia]: BASE_SEPOLIA_RPC_URL,
        [ESupportedChains.Coverage]: "http://localhost:8555",
        [ESupportedChains.Hardhat]: "http://localhost:8545",
        [ESupportedChains.Saigon]: SAIGON_RPC_URL,
    };
};
exports.getNetworkRpcUrls = getNetworkRpcUrls;
const getEtherscanApiKeys = () => ({
    [ESupportedChains.Sepolia]: process.env.ETH_ETHERSCAN_API_KEY,
    [ESupportedChains.Optimism]: process.env.OPTIMISM_ETHERSCAN_API_KEY,
    [ESupportedChains.OptimismSepolia]: process.env.OPTIMISM_ETHERSCAN_API_KEY,
    [ESupportedChains.Scroll]: process.env.SCROLL_ETHERSCAN_API_KEY,
    [ESupportedChains.ScrollSepolia]: process.env.SCROLL_ETHERSCAN_API_KEY,
    [ESupportedChains.Arbitrum]: process.env.ARB_ETHERSCAN_API_KEY,
    [ESupportedChains.ArbitrumSepolia]: process.env.ARB_ETHERSCAN_API_KEY,
    [ESupportedChains.Base]: process.env.BASE_ETHERSCAN_API_KEY,
    [ESupportedChains.BaseSepolia]: process.env.BASE_ETHERSCAN_API_KEY,
    [ESupportedChains.Saigon]: process.env.SAIGON_ETHERSCAN_API_KEY,
    [ESupportedChains.Coverage]: undefined,
    [ESupportedChains.Hardhat]: undefined,
});
exports.getEtherscanApiKeys = getEtherscanApiKeys;
exports.ONE_WEEK_IN_SECONDS = 604800;
