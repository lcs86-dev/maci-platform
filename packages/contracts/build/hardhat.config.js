"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-extraneous-dependencies */
require("@nomicfoundation/hardhat-toolbox");
const dotenv_1 = __importDefault(require("dotenv"));
require("hardhat-artifactor");
require("hardhat-contract-sizer");
const maci_contracts_1 = require("maci-contracts");
require("maci-contracts/tasks/deploy");
require("maci-contracts/tasks/runner/deployFull");
require("maci-contracts/tasks/runner/deployPoll");
require("maci-contracts/tasks/runner/verifyFull");
require("solidity-docgen");
// Don't forget to import new tasks here
require("./tasks/deploy");
const constants_1 = require("./tasks/helpers/constants");
require("./tasks/runner/initPoll");
require("./tasks/runner/merge");
require("./tasks/runner/prove");
require("./tasks/runner/submitOnChain");
dotenv_1.default.config();
const deployment = maci_contracts_1.Deployment.getInstance({ contractNames: constants_1.EContracts });
deployment.setContractNames(constants_1.EContracts);
const DEFAULT_BLOCK_GAS_LIMIT = process.env.BLOCK_GAS_LIMIT ? Number(process.env.BLOCK_GAS_LIMIT) : 30000000;
const DEFAULT_GAS_MUL = 2;
const TEST_MNEMONIC = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const NETWORKS_RPC_URL = (0, constants_1.getNetworkRpcUrls)();
const GAS_PRICE = process.env.GAS_PRICE ? Number(process.env.GAS_PRICE) : "auto";
const ETHERSCAN_API_KEYS = (0, constants_1.getEtherscanApiKeys)();
const getCommonNetworkConfig = (networkName, chainId, mnemonic) => ({
    url: NETWORKS_RPC_URL[networkName],
    blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
    gasMultiplier: DEFAULT_GAS_MUL,
    gasPrice: GAS_PRICE,
    saveDeployments: true,
    chainId,
    accounts: {
        mnemonic: mnemonic || process.env.MNEMONIC || TEST_MNEMONIC,
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
    },
});
const config = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    defaultNetwork: "localhost",
    networks: {
        sepolia: getCommonNetworkConfig(constants_1.ESupportedChains.Sepolia, constants_1.EChainId.Sepolia),
        optimism: getCommonNetworkConfig(constants_1.ESupportedChains.Optimism, constants_1.EChainId.Optimism),
        optimism_sepolia: getCommonNetworkConfig(constants_1.ESupportedChains.OptimismSepolia, constants_1.EChainId.OptimismSepolia),
        scroll: getCommonNetworkConfig(constants_1.ESupportedChains.Scroll, constants_1.EChainId.Scroll),
        scroll_sepolia: getCommonNetworkConfig(constants_1.ESupportedChains.ScrollSepolia, constants_1.EChainId.ScrollSepolia),
        arbitrum: getCommonNetworkConfig(constants_1.ESupportedChains.Arbitrum, constants_1.EChainId.Arbitrum),
        arbitrum_sepolia: getCommonNetworkConfig(constants_1.ESupportedChains.ArbitrumSepolia, constants_1.EChainId.ArbitrumSepolia),
        base: getCommonNetworkConfig(constants_1.ESupportedChains.Base, constants_1.EChainId.Base),
        base_sepolia: getCommonNetworkConfig(constants_1.ESupportedChains.BaseSepolia, constants_1.EChainId.BaseSepolia),
        coverage: getCommonNetworkConfig(constants_1.ESupportedChains.Coverage, constants_1.EChainId.Coverage, TEST_MNEMONIC),
        saigon: getCommonNetworkConfig(constants_1.ESupportedChains.Saigon, constants_1.EChainId.Saigon),
        localhost: {
            url: "http://localhost:8545",
            loggingEnabled: false,
        },
        hardhat: {
            blockGasLimit: DEFAULT_BLOCK_GAS_LIMIT,
            gasMultiplier: DEFAULT_GAS_MUL,
            gasPrice: "auto",
            chainId: constants_1.EChainId.Hardhat,
            accounts: {
                mnemonic: TEST_MNEMONIC,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
            },
            gas: DEFAULT_BLOCK_GAS_LIMIT,
            loggingEnabled: process.env.HARDHAT_LOGGING === "true",
            allowUnlimitedContractSize: true,
            throwOnTransactionFailures: true,
            throwOnCallFailures: true,
            mining: {
                auto: true,
                interval: 100,
            },
            forking: process.env.FORKING_URL
                ? {
                    url: process.env.FORKING_URL,
                    blockNumber: process.env.FORKING_BLOCK_NUM ? parseInt(process.env.FORKING_BLOCK_NUM, 10) : 0,
                }
                : undefined,
        },
    },
    contractSizer: {
        alphaSort: true,
        runOnCompile: true,
        disambiguatePaths: false,
    },
    etherscan: {
        apiKey: {
            [constants_1.ESupportedChains.Sepolia]: ETHERSCAN_API_KEYS[constants_1.ESupportedChains.Sepolia],
            [constants_1.ESupportedChains.Optimism]: ETHERSCAN_API_KEYS[constants_1.ESupportedChains.Optimism],
            [constants_1.ESupportedChains.OptimismSepolia]: ETHERSCAN_API_KEYS[constants_1.ESupportedChains.OptimismSepolia],
            [constants_1.ESupportedChains.Scroll]: ETHERSCAN_API_KEYS[constants_1.ESupportedChains.Scroll],
            [constants_1.ESupportedChains.ScrollSepolia]: ETHERSCAN_API_KEYS[constants_1.ESupportedChains.ScrollSepolia],
            [constants_1.ESupportedChains.Arbitrum]: ETHERSCAN_API_KEYS[constants_1.ESupportedChains.Arbitrum],
            [constants_1.ESupportedChains.ArbitrumSepolia]: ETHERSCAN_API_KEYS[constants_1.ESupportedChains.ArbitrumSepolia],
            [constants_1.ESupportedChains.Base]: ETHERSCAN_API_KEYS[constants_1.ESupportedChains.Base],
            [constants_1.ESupportedChains.BaseSepolia]: ETHERSCAN_API_KEYS[constants_1.ESupportedChains.BaseSepolia],
        },
        customChains: [
            {
                network: constants_1.ESupportedChains.Optimism,
                chainId: constants_1.EChainId.Optimism,
                urls: {
                    apiURL: "https://api-optimistic.etherscan.io/api",
                    browserURL: "https://optimistic.etherscan.io",
                },
            },
            {
                network: constants_1.ESupportedChains.OptimismSepolia,
                chainId: constants_1.EChainId.OptimismSepolia,
                urls: {
                    apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
                    browserURL: "https://sepolia-optimistic.etherscan.io",
                },
            },
            {
                network: constants_1.ESupportedChains.Scroll,
                chainId: constants_1.EChainId.Scroll,
                urls: {
                    apiURL: "https://api.scrollscan.com/api",
                    browserURL: "https://scrollscan.com/",
                },
            },
            {
                network: constants_1.ESupportedChains.ScrollSepolia,
                chainId: constants_1.EChainId.ScrollSepolia,
                urls: {
                    apiURL: "https://api-sepolia.scrollscan.com/api",
                    browserURL: "https://sepolia.scrollscan.com/",
                },
            },
            {
                network: constants_1.ESupportedChains.Arbitrum,
                chainId: constants_1.EChainId.Arbitrum,
                urls: {
                    apiURL: "https://api.arbiscan.io/api",
                    browserURL: "https://arbiscan.io/",
                },
            },
            {
                network: constants_1.ESupportedChains.ArbitrumSepolia,
                chainId: constants_1.EChainId.ArbitrumSepolia,
                urls: {
                    apiURL: "https://api-sepolia.arbiscan.io/api",
                    browserURL: "https://sepolia.arbiscan.io/",
                },
            },
            {
                network: constants_1.ESupportedChains.Base,
                chainId: constants_1.EChainId.Base,
                urls: {
                    apiURL: "https://api.basescan.org/api",
                    browserURL: "https://basescan.org/",
                },
            },
            {
                network: constants_1.ESupportedChains.BaseSepolia,
                chainId: constants_1.EChainId.BaseSepolia,
                urls: {
                    apiURL: "https://api-sepolia.basescan.org/api",
                    browserURL: "https://sepolia.basescan.org/",
                },
            },
        ],
    },
    sourcify: {
        enabled: true,
    },
    paths: {
        tests: "./tests",
        artifacts: "./artifacts",
    },
    docgen: {
        outputDir: "./docs",
        pages: "files",
        exclude: ["./trees/zeros"],
    },
    gasReporter: {
        currency: "USD",
        enabled: true,
    },
};
exports.default = config;
