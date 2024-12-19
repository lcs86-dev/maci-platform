import { deserializePermissionAccount } from "@zerodev/permissions";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { createKernelAccountClient } from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import dotenv from "dotenv";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ErrorCodes } from "./errors";
import { ESupportedNetworks, viemChain } from "./networks";
dotenv.config();
/**
 * Generate the RPCUrl for Pimlico based on the chain we need to interact with
 *
 * @param network - the network we want to interact with
 * @returns the RPCUrl for the network
 */
export const genPimlicoRPCUrl = (network) => {
    const pimlicoAPIKey = process.env.PIMLICO_API_KEY;
    if (!pimlicoAPIKey) {
        throw new Error(ErrorCodes.PIMLICO_API_KEY_NOT_SET.toString());
    }
    return `https://api.pimlico.io/v2/${network}/rpc?apikey=${pimlicoAPIKey}`;
};
/**
 * Generate the RPCUrl for Alchemy based on the chain we need to interact with
 *
 * @param network - the network we want to interact with
 * @returns the RPCUrl for the network
 */
export const genAlchemyRPCUrl = (network) => {
    const rpcAPIKey = process.env.RPC_API_KEY;
    if (!rpcAPIKey) {
        throw new Error(ErrorCodes.RPC_API_KEY_NOT_SET.toString());
    }
    switch (network) {
        case ESupportedNetworks.OPTIMISM_SEPOLIA:
            return `https://opt-sepolia.g.alchemy.com/v2/${rpcAPIKey}`;
        case ESupportedNetworks.ETHEREUM_SEPOLIA:
            return `https://eth-sepolia.g.alchemy.com/v2/${rpcAPIKey}`;
        default:
            throw new Error(ErrorCodes.UNSUPPORTED_NETWORK.toString());
    }
};
/**
 * Get a public client
 *
 * @param chainName - the name of the chain to use
 * @returns the public client
 */
export const getPublicClient = (chainName) => createPublicClient({
    transport: http(genAlchemyRPCUrl(chainName)),
    chain: viemChain(chainName),
});
/**
 * Get a Kernel account handle given a session key
 *
 * @param sessionKey - the session key to use
 * @param approval - the approval to the session key
 * @param chain - the chain to use
 * @returns the kernel client
 */
export const getKernelClient = async (sessionKey, approval, chain) => {
    const bundlerUrl = genPimlicoRPCUrl(chain);
    const publicClient = getPublicClient(chain);
    // Using a stored private key
    const sessionKeySigner = toECDSASigner({
        signer: privateKeyToAccount(sessionKey),
    });
    const sessionKeyAccount = await deserializePermissionAccount(publicClient, ENTRYPOINT_ADDRESS_V07, KERNEL_V3_1, approval, sessionKeySigner);
    const kernelClient = createKernelAccountClient({
        bundlerTransport: http(bundlerUrl),
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        account: sessionKeyAccount,
        chain: viemChain(chain),
    });
    return kernelClient;
};
