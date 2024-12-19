var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProofGeneratorService_1;
import { Logger, Injectable } from "@nestjs/common";
import { ZeroAddress } from "ethers";
import hre from "hardhat";
import { Deployment, EContracts, ProofGenerator, Poll__factory as PollFactory, MACI__factory as MACIFactory, } from "maci-contracts";
import { Keypair, PrivKey, PubKey } from "maci-domainobjs";
import path from "path";
import { ErrorCodes } from "../common";
import { getPublicClient } from "../common/accountAbstraction";
import { CryptoService } from "../crypto/crypto.service";
import { FileService } from "../file/file.service";
import { SessionKeysService } from "../sessionKeys/sessionKeys.service";
/**
 * ProofGeneratorService is responsible for generating message processing and tally proofs.
 */
let ProofGeneratorService = ProofGeneratorService_1 = class ProofGeneratorService {
    cryptoService;
    fileService;
    sessionKeysService;
    /**
     * Deployment helper
     */
    deployment;
    /**
     * Logger
     */
    logger;
    /**
     * Proof generator initialization
     */
    constructor(cryptoService, fileService, sessionKeysService) {
        this.cryptoService = cryptoService;
        this.fileService = fileService;
        this.sessionKeysService = sessionKeysService;
        this.deployment = Deployment.getInstance({ hre });
        this.deployment.setHre(hre);
        this.logger = new Logger(ProofGeneratorService_1.name);
    }
    /**
     * Generate proofs for message processing and tally
     *
     * @param args - generate proofs arguments
     * @returns - generated proofs for message processing and tally
     */
    async generate({ poll, maciContractAddress, tallyContractAddress, useQuadraticVoting, encryptedCoordinatorPrivateKey, startBlock, endBlock, blocksPerBatch, }, options) {
        try {
            const maciContract = await this.deployment.getContract({
                name: EContracts.MACI,
                address: maciContractAddress,
            });
            const [signer, pollContracts] = await Promise.all([this.deployment.getDeployer(), maciContract.polls(poll)]);
            if (pollContracts.poll.toLowerCase() === ZeroAddress.toLowerCase()) {
                this.logger.error(`Error: ${ErrorCodes.POLL_NOT_FOUND}, Poll ${poll} not found`);
                throw new Error(ErrorCodes.POLL_NOT_FOUND.toString());
            }
            const pollContract = await this.deployment.getContract({
                name: EContracts.Poll,
                address: pollContracts.poll,
            });
            const [coordinatorPublicKey, isStateAqMerged] = await Promise.all([
                pollContract.coordinatorPubKey(),
                pollContract.stateMerged(),
            ]);
            if (!isStateAqMerged) {
                this.logger.error(`Error: ${ErrorCodes.NOT_MERGED_STATE_TREE}, state tree is not merged`);
                throw new Error(ErrorCodes.NOT_MERGED_STATE_TREE.toString());
            }
            const { privateKey } = await this.fileService.getPrivateKey();
            const maciPrivateKey = PrivKey.deserialize(this.cryptoService.decrypt(privateKey, encryptedCoordinatorPrivateKey));
            const coordinatorKeypair = new Keypair(maciPrivateKey);
            const publicKey = new PubKey([
                BigInt(coordinatorPublicKey.x.toString()),
                BigInt(coordinatorPublicKey.y.toString()),
            ]);
            if (!coordinatorKeypair.pubKey.equals(publicKey)) {
                this.logger.error(`Error: ${ErrorCodes.PRIVATE_KEY_MISMATCH}, wrong private key`);
                throw new Error(ErrorCodes.PRIVATE_KEY_MISMATCH.toString());
            }
            const outputDir = path.resolve("./proofs");
            const maciState = await ProofGenerator.prepareState({
                maciContract,
                pollContract,
                maciPrivateKey,
                coordinatorKeypair,
                pollId: poll,
                signer,
                outputDir,
                options: {
                    startBlock,
                    endBlock,
                    blocksPerBatch,
                },
            });
            const foundPoll = maciState.polls.get(BigInt(poll));
            if (!foundPoll) {
                this.logger.error(`Error: ${ErrorCodes.POLL_NOT_FOUND}, Poll ${poll} not found in maci state`);
                throw new Error(ErrorCodes.POLL_NOT_FOUND.toString());
            }
            const proofGenerator = new ProofGenerator({
                poll: foundPoll,
                maciContractAddress,
                tallyContractAddress,
                tally: this.fileService.getZkeyFilePaths(process.env.COORDINATOR_TALLY_ZKEY_NAME, useQuadraticVoting),
                mp: this.fileService.getZkeyFilePaths(process.env.COORDINATOR_MESSAGE_PROCESS_ZKEY_NAME, useQuadraticVoting),
                rapidsnark: process.env.COORDINATOR_RAPIDSNARK_EXE,
                outputDir,
                tallyOutputFile: path.resolve("./tally.json"),
                useQuadraticVoting,
            });
            const processProofs = await proofGenerator.generateMpProofs(options);
            const { proofs: tallyProofs, tallyData } = await proofGenerator.generateTallyProofs(hre.network, options);
            return {
                processProofs,
                tallyProofs,
                tallyData,
            };
        }
        catch (error) {
            options?.onFail?.(error);
            throw error;
        }
    }
    /**
     * Merge state and message trees
     *
     * @param args - merge arguments
     * @returns whether the proofs were successfully merged
     */
    async merge({ maciContractAddress, pollId, approval, sessionKeyAddress, chain }) {
        const publicClient = getPublicClient(chain);
        const pollContracts = await publicClient.readContract({
            address: maciContractAddress,
            abi: MACIFactory.abi,
            functionName: "getPoll",
            args: [BigInt(pollId)],
        });
        const pollAddress = pollContracts.poll;
        if (pollAddress.toLowerCase() === ZeroAddress.toLowerCase()) {
            this.logger.error(`Error: ${ErrorCodes.POLL_NOT_FOUND}, Poll ${pollId} not found`);
            throw new Error(ErrorCodes.POLL_NOT_FOUND.toString());
        }
        // get a kernel client
        const kernelClient = await this.sessionKeysService.generateClientFromSessionKey(sessionKeyAddress, approval, chain);
        // start with the state tree
        const isStateMerged = await publicClient.readContract({
            address: pollAddress,
            abi: PollFactory.abi,
            functionName: "stateMerged",
        });
        if (isStateMerged) {
            this.logger.debug("State tree is already merged");
        }
        else {
            // merge it
            const { request } = await publicClient.simulateContract({
                // @ts-expect-error type error between permissionless.js and viem
                account: kernelClient.account,
                address: pollAddress,
                abi: PollFactory.abi,
                functionName: "mergeState",
            });
            const txHash = await kernelClient.writeContract(request);
            const txReceipt = await publicClient.waitForTransactionReceipt({
                hash: txHash,
            });
            if (txReceipt.status !== "success") {
                this.logger.error(`Error: ${ErrorCodes.FAILED_TO_MERGE_STATE_TREE}, state tree merge failed`);
                throw new Error(ErrorCodes.FAILED_TO_MERGE_STATE_TREE.toString());
            }
        }
        return true;
    }
};
ProofGeneratorService = ProofGeneratorService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [CryptoService,
        FileService,
        SessionKeysService])
], ProofGeneratorService);
export { ProofGeneratorService };