import { arbitrum, arbitrumSepolia, base, baseSepolia, bsc, gnosis, holesky, linea, lineaSepolia, localhost, mainnet, optimism, optimismSepolia, polygon, scroll, scrollSepolia, sepolia, } from "viem/chains";
export var ESupportedNetworks;
(function (ESupportedNetworks) {
    ESupportedNetworks["ETHEREUM"] = "mainnet";
    ESupportedNetworks["OPTIMISM"] = "optimism";
    ESupportedNetworks["OPTIMISM_SEPOLIA"] = "optimism-sepolia";
    ESupportedNetworks["BSC"] = "bsc";
    ESupportedNetworks["BSC_CHAPEL"] = "chapel";
    ESupportedNetworks["GNOSIS_CHAIN"] = "gnosis";
    ESupportedNetworks["POLYGON"] = "matic";
    ESupportedNetworks["ARBITRUM_ONE"] = "arbitrum-one";
    ESupportedNetworks["HOLESKY"] = "holesky";
    ESupportedNetworks["LINEA_SEPOLIA"] = "linea-sepolia";
    ESupportedNetworks["BASE_SEPOLIA"] = "base-sepolia";
    ESupportedNetworks["ETHEREUM_SEPOLIA"] = "sepolia";
    ESupportedNetworks["ARBITRUM_SEPOLIA"] = "arbitrum-sepolia";
    ESupportedNetworks["LINEA"] = "linea";
    ESupportedNetworks["BASE"] = "base";
    ESupportedNetworks["SCROLL_SEPOLIA"] = "scroll-sepolia";
    ESupportedNetworks["SCROLL"] = "scroll";
    ESupportedNetworks["LOCALHOST"] = "localhost";
})(ESupportedNetworks || (ESupportedNetworks = {}));
/**
 * Get the Viem chain for a given network
 *
 * @param network - the network to get the chain for
 * @returns the Viem chain
 */
export const viemChain = (network) => {
    switch (network) {
        case ESupportedNetworks.ETHEREUM:
            return mainnet;
        case ESupportedNetworks.ETHEREUM_SEPOLIA:
            return sepolia;
        case ESupportedNetworks.ARBITRUM_ONE:
            return arbitrum;
        case ESupportedNetworks.ARBITRUM_SEPOLIA:
            return arbitrumSepolia;
        case ESupportedNetworks.BASE_SEPOLIA:
            return baseSepolia;
        case ESupportedNetworks.LINEA_SEPOLIA:
            return lineaSepolia;
        case ESupportedNetworks.SCROLL_SEPOLIA:
            return scrollSepolia;
        case ESupportedNetworks.SCROLL:
            return scroll;
        case ESupportedNetworks.BASE:
            return base;
        case ESupportedNetworks.HOLESKY:
            return holesky;
        case ESupportedNetworks.LINEA:
            return linea;
        case ESupportedNetworks.BSC:
            return bsc;
        case ESupportedNetworks.GNOSIS_CHAIN:
            return gnosis;
        case ESupportedNetworks.POLYGON:
            return polygon;
        case ESupportedNetworks.OPTIMISM:
            return optimism;
        case ESupportedNetworks.OPTIMISM_SEPOLIA:
            return optimismSepolia;
        case ESupportedNetworks.LOCALHOST:
            return localhost;
        default:
            throw new Error(`Unsupported network: ${network}`);
    }
};
