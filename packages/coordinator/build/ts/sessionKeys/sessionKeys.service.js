var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SessionKeysService_1;
import { Injectable, Logger } from "@nestjs/common";
import { deserializePermissionAccount } from "@zerodev/permissions";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { createKernelAccountClient } from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { http } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { ErrorCodes } from "../common";
import { getPublicClient } from "../common/accountAbstraction";
import { viemChain } from "../common/networks";
import { FileService } from "../file/file.service";
/**
 * SessionKeysService is responsible for generating and managing session keys.
 */
let SessionKeysService = SessionKeysService_1 = class SessionKeysService {
    fileService;
    /**
     * Logger
     */
    logger;
    /**
     * Create a new instance of SessionKeysService
     *
     * @param fileService - file service
     */
    constructor(fileService) {
        this.fileService = fileService;
        this.logger = new Logger(SessionKeysService_1.name);
    }
    /**
     * Generate a session key
     *
     * @returns session key address
     */
    generateSessionKey() {
        const sessionPrivateKey = generatePrivateKey();
        const sessionKeySigner = toECDSASigner({
            signer: privateKeyToAccount(sessionPrivateKey),
        });
        const sessionKeyAddress = sessionKeySigner.account.address;
        // save the key
        this.fileService.storeSessionKey(sessionPrivateKey, sessionKeyAddress);
        return {
            sessionKeyAddress,
        };
    }
    /**
     * Generate a KernelClient from a session key and an approval
     *
     * @param sessionKeyAddress - the address of the session key
     * @param approval - the approval string
     * @param chain - the chain to use
     * @returns a KernelAccountClient
     */
    async generateClientFromSessionKey(sessionKeyAddress, approval, chain) {
        // retrieve the session key from the file service
        const sessionKey = this.fileService.getSessionKey(sessionKeyAddress);
        if (!sessionKey) {
            this.logger.error(`Session key not found: ${sessionKeyAddress}`);
            throw new Error(ErrorCodes.SESSION_KEY_NOT_FOUND.toString());
        }
        // create a public client
        const publicClient = getPublicClient(chain);
        // Using a stored private key
        const sessionKeySigner = toECDSASigner({
            signer: privateKeyToAccount(sessionKey),
        });
        try {
            // deserialize the permission account using approval and session key
            const sessionKeyAccount = await deserializePermissionAccount(publicClient, ENTRYPOINT_ADDRESS_V07, KERNEL_V3_1, approval, sessionKeySigner);
            return createKernelAccountClient({
                bundlerTransport: http(process.env.ZERODEV_BUNDLER_RPC),
                entryPoint: ENTRYPOINT_ADDRESS_V07,
                account: sessionKeyAccount,
                chain: viemChain(chain),
            });
        }
        catch (error) {
            this.logger.error(`Error: ${ErrorCodes.INVALID_APPROVAL}`, error);
            throw new Error(ErrorCodes.INVALID_APPROVAL.toString());
        }
    }
    /**
     * Deactivate a session key
     *
     * @param sessionKeyAddress - key address
     */
    deactivateSessionKey(sessionKeyAddress) {
        this.fileService.deleteSessionKey(sessionKeyAddress);
    }
};
SessionKeysService = SessionKeysService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [FileService])
], SessionKeysService);
export { SessionKeysService };
