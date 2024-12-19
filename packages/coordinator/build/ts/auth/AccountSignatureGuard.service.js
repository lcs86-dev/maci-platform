var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AccountSignatureGuard_1;
import { Logger, Injectable, SetMetadata, } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { CryptoService } from "../crypto/crypto.service";
/**
 * Public metadata key
 */
export const PUBLIC_METADATA_KEY = "isPublic";
/**
 * Public decorator to by-pass auth checks
 *
 * @returns public decorator
 */
export const Public = () => SetMetadata(PUBLIC_METADATA_KEY, true);
/**
 * AccountSignatureGuard is responsible for protecting calling controller and websocket gateway functions.
 * If account address is not added to .env file, you will not be allowed to call any API methods.
 * Make sure you send `Authorization: Bearer encrypt({signature}:{digest})` header where:
 * 1. encrypt - RSA public encryption.
 * 2. signature - eth wallet signature for any message
 * 3. digest - hex representation of message digest
 *
 * ```
 * const signature = await signer.signMessage("message");
 * const digest = Buffer.from(getBytes(hashMessage("message"))).toString("hex");
 * ```
 * See tests for more details about authorization.
 */
let AccountSignatureGuard = AccountSignatureGuard_1 = class AccountSignatureGuard {
    cryptoService;
    reflector;
    /**
     * Logger
     */
    logger;
    constructor(cryptoService, reflector) {
        this.cryptoService = cryptoService;
        this.reflector = reflector;
        this.logger = new Logger(AccountSignatureGuard_1.name);
    }
    /**
     * This function should return a boolean, indicating  whether the request is allowed or not based on message signature and digest.
     *
     * @param ctx - execution context
     * @returns whether the request is allowed or not
     */
    async canActivate(ctx) {
        try {
            const isPublic = this.reflector.get(PUBLIC_METADATA_KEY, ctx.getHandler());
            if (isPublic) {
                return true;
            }
            const request = ctx.switchToHttp().getRequest();
            const socket = ctx.switchToWs().getClient();
            const encryptedHeader = socket.handshake?.headers.authorization || request.headers?.authorization;
            if (!encryptedHeader) {
                this.logger.warn("No authorization header");
                return false;
            }
            const privateKey = await fs.promises.readFile(path.resolve(process.env.COORDINATOR_PRIVATE_KEY_PATH));
            const [signature, digest] = this.cryptoService
                .decrypt(privateKey, encryptedHeader.replace("Bearer", "").trim())
                .split(":");
            if (!signature || !digest) {
                this.logger.warn("No signature or digest");
                return false;
            }
            const address = ethers.recoverAddress(Buffer.from(digest, "hex"), signature).toLowerCase();
            const coordinatorAddress = process.env.COORDINATOR_ADDRESSES?.split(",").map((value) => value.toLowerCase()) ?? [];
            return coordinatorAddress.includes(address);
        }
        catch (error) {
            this.logger.error("Error", error);
            return false;
        }
    }
};
AccountSignatureGuard = AccountSignatureGuard_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [CryptoService,
        Reflector])
], AccountSignatureGuard);
export { AccountSignatureGuard };
