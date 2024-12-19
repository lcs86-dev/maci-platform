import { EDeploySteps as EMaciDeploySteps, EContracts as EMaciContracts } from "maci-contracts";
import type { BigNumberish } from "ethers";
/**
 * Deploy steps for maci-platform related constacts
 */
export declare enum EPlatformDeployStep {
    RegistryManager = "full:deploy-registry-manager"
}
/**
 * Deploy steps for maci and maci-platform
 */
export declare const EDeploySteps: {
    RegistryManager: EPlatformDeployStep.RegistryManager;
    ConstantInitialVoiceCreditProxy: EMaciDeploySteps.ConstantInitialVoiceCreditProxy;
    Gatekeepers: EMaciDeploySteps.Gatekeepers;
    Verifier: EMaciDeploySteps.Verifier;
    Poseidon: EMaciDeploySteps.Poseidon;
    PollFactory: EMaciDeploySteps.PollFactory;
    MessageProcessorFactory: EMaciDeploySteps.MessageProcessorFactory;
    TallyFactory: EMaciDeploySteps.TallyFactory;
    Maci: EMaciDeploySteps.Maci;
    VkRegistry: EMaciDeploySteps.VkRegistry;
    Poll: EMaciDeploySteps.Poll;
};
/**
 * Contracts for maci-platform related constacts
 */
export declare enum EPlatformContracts {
    EASRegistryManager = "EASRegistryManager",
    RegistryManager = "RegistryManager",
    EASRegistry = "EASRegistry",
    SimpleRegistry = "SimpleRegistry",
    MockERC20 = "MockERC20"
}
/**
 * Contracts for maci and maci-platform
 */
export declare const EContracts: {
    EASRegistryManager: EPlatformContracts.EASRegistryManager;
    RegistryManager: EPlatformContracts.RegistryManager;
    EASRegistry: EPlatformContracts.EASRegistry;
    SimpleRegistry: EPlatformContracts.SimpleRegistry;
    MockERC20: EPlatformContracts.MockERC20;
    ConstantInitialVoiceCreditProxy: EMaciContracts.ConstantInitialVoiceCreditProxy;
    FreeForAllGatekeeper: EMaciContracts.FreeForAllGatekeeper;
    EASGatekeeper: EMaciContracts.EASGatekeeper;
    GitcoinPassportGatekeeper: EMaciContracts.GitcoinPassportGatekeeper;
    HatsGatekeeper: EMaciContracts.HatsGatekeeper;
    HatsGatekeeperSingle: EMaciContracts.HatsGatekeeperSingle;
    HatsGatekeeperMultiple: EMaciContracts.HatsGatekeeperMultiple;
    ZupassGatekeeper: EMaciContracts.ZupassGatekeeper;
    ZupassGroth16Verifier: EMaciContracts.ZupassGroth16Verifier;
    SemaphoreGatekeeper: EMaciContracts.SemaphoreGatekeeper;
    MerkleProofGatekeeper: EMaciContracts.MerkleProofGatekeeper;
    SignUpGatekeeper: EMaciContracts.SignUpGatekeeper;
    Verifier: EMaciContracts.Verifier;
    MACI: EMaciContracts.MACI;
    StateAq: EMaciContracts.StateAq;
    PollFactory: EMaciContracts.PollFactory;
    MessageProcessorFactory: EMaciContracts.MessageProcessorFactory;
    TallyFactory: EMaciContracts.TallyFactory;
    PoseidonT3: EMaciContracts.PoseidonT3;
    PoseidonT4: EMaciContracts.PoseidonT4;
    PoseidonT5: EMaciContracts.PoseidonT5;
    PoseidonT6: EMaciContracts.PoseidonT6;
    VkRegistry: EMaciContracts.VkRegistry;
    Poll: EMaciContracts.Poll;
    Tally: EMaciContracts.Tally;
    MessageProcessor: EMaciContracts.MessageProcessor;
    AccQueue: EMaciContracts.AccQueue;
    AccQueueQuinaryBlankSl: EMaciContracts.AccQueueQuinaryBlankSl;
    AccQueueQuinaryMaci: EMaciContracts.AccQueueQuinaryMaci;
};
/**
 * Supported registry manager types
 */
export type TRegistryManager = EPlatformContracts.EASRegistryManager | EPlatformContracts.RegistryManager;
/**
 * Supported registry types
 */
export type TRegistry = EPlatformContracts.EASRegistry | EPlatformContracts.SimpleRegistry;
/**
 * Registry types by registry manager
 */
export declare const REGISTRY_TYPES: Record<TRegistryManager, TRegistry>;
/**
 * Supported networks for deployment and task running
 */
export declare enum ESupportedChains {
    Sepolia = "sepolia",
    Optimism = "optimism",
    OptimismSepolia = "optimism_sepolia",
    Scroll = "scroll",
    ScrollSepolia = "scroll_sepolia",
    Arbitrum = "arbitrum",
    ArbitrumSepolia = "arbitrum_sepolia",
    Base = "base",
    BaseSepolia = "base_sepolia",
    Coverage = "coverage",
    Hardhat = "hardhat",
    Saigon = "saigon"
}
/**
 * Supported network chain ids for deployment and task running
 */
export declare enum EChainId {
    Hardhat = 31337,
    Optimism = 10,
    OptimismSepolia = 11155420,
    Sepolia = 11155111,
    Scroll = 534352,
    ScrollSepolia = 534351,
    Arbitrum = 42161,
    ArbitrumSepolia = 421614,
    Base = 8453,
    BaseSepolia = 84532,
    Coverage = 1337,
    Saigon = 2021
}
/**
 * Get network rpc urls object
 *
 * @returns {Record<ESupportedChains, string>} rpc urls for supported networks
 */
export declare const getNetworkRpcUrls: () => Record<ESupportedChains, string>;
export declare const getEtherscanApiKeys: () => Record<ESupportedChains, string | undefined>;
export declare const ONE_WEEK_IN_SECONDS = 604800;
/**
 * Interface that represents task submitOnChain params
 */
export interface ISubmitOnChainParams {
    /**
     * The poll id
     */
    poll: BigNumberish;
    /**
     * The directory where proofs are stored
     */
    outputDir: string;
    /**
     * The file to store the tally proof
     */
    tallyFile: string;
}
