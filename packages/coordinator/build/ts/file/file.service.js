var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FileService_1;
import { Injectable, Logger } from "@nestjs/common";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import fs from "fs";
import path from "path";
import { ErrorCodes } from "../common";
/**
 * FileService is responsible for working with local files like:
 * 1. RSA public/private keys
 * 2. Zkey files
 */
let FileService = FileService_1 = class FileService {
    /**
     * Logger
     */
    logger;
    /**
     * Json file database instance
     */
    db;
    /**
     * Initialize service
     */
    constructor() {
        this.logger = new Logger(FileService_1.name);
        this.db = low(new FileSync(path.resolve(process.cwd(), "./session-keys.json")));
    }
    /**
     * Store session key
     *
     * @param sessionKey - session key
     * @param address - key address
     */
    storeSessionKey(sessionKey, address) {
        this.db.set(address, sessionKey).write();
    }
    /**
     * Delete session key
     *
     * @param address - key address
     */
    deleteSessionKey(address) {
        this.db.unset(address).write();
    }
    /**
     * Get session key
     *
     * @param address - key name
     * @returns session key
     */
    getSessionKey(address) {
        return this.db.get(address).value();
    }
    /**
     * Get RSA private key for coordinator service
     *
     * @returns serialized RSA public key
     */
    async getPublicKey() {
        const publicKey = await fs.promises.readFile(path.resolve(process.env.COORDINATOR_PUBLIC_KEY_PATH));
        return { publicKey: publicKey.toString() };
    }
    /**
     * Get RSA private key for coordinator service
     *
     * @returns serialized RSA private key
     */
    async getPrivateKey() {
        const privateKey = await fs.promises.readFile(path.resolve(process.env.COORDINATOR_PRIVATE_KEY_PATH));
        return { privateKey: privateKey.toString() };
    }
    /**
     * Get zkey, wasm and witgen filepaths for zkey set
     *
     * @param name - zkey set name
     * @param useQuadraticVoting - whether to use Qv or NonQv
     * @returns zkey and wasm filepaths
     */
    getZkeyFilePaths(name, useQuadraticVoting) {
        const root = path.resolve(process.env.COORDINATOR_ZKEY_PATH);
        const index = name.indexOf("_");
        const type = name.slice(0, index);
        const params = name.slice(index + 1);
        const mode = useQuadraticVoting ? "" : "NonQv";
        const filename = `${type}${mode}_${params}`;
        const zkey = path.resolve(root, `${filename}/${filename}.0.zkey`);
        const wasm = path.resolve(root, `${filename}/${filename}_js/${filename}.wasm`);
        const witgen = path.resolve(root, `${filename}/${filename}_cpp/${filename}`);
        if (!fs.existsSync(zkey) || (!fs.existsSync(wasm) && !fs.existsSync(witgen))) {
            this.logger.error(`Error: ${ErrorCodes.FILE_NOT_FOUND}, zkey: ${zkey}, wasm: ${wasm}, witgen: ${witgen}`);
            throw new Error(ErrorCodes.FILE_NOT_FOUND.toString());
        }
        return {
            zkey,
            wasm,
            witgen,
        };
    }
};
FileService = FileService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], FileService);
export { FileService };
