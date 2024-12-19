import { HttpStatus, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getBytes, hashMessage } from "ethers";
import hardhat from "hardhat";
import { deploy, deployPoll, deployVkRegistryContract, setVerifyingKeys, signup, publish, timeTravel, mergeSignups, } from "maci-cli";
import { Poll__factory as PollFactory } from "maci-contracts";
import { Keypair } from "maci-domainobjs";
import { io } from "socket.io-client";
import request from "supertest";
import fs from "fs";
import path from "path";
import { AppModule } from "../ts/app.module";
import { ErrorCodes, ESupportedNetworks } from "../ts/common";
import { CryptoService } from "../ts/crypto/crypto.service";
import { FileModule } from "../ts/file/file.module";
import { EProofGenerationEvents } from "../ts/proof/types";
import { ESubgraphEvents } from "../ts/subgraph/types";
const STATE_TREE_DEPTH = 10;
const INT_STATE_TREE_DEPTH = 1;
const VOTE_OPTION_TREE_DEPTH = 2;
const MSG_BATCH_SIZE = 20;
describe("e2e", () => {
    const coordinatorKeypair = new Keypair();
    let app;
    let signer;
    let maciAddresses;
    let pollContracts;
    let socket;
    const cryptoService = new CryptoService();
    const getAuthorizationHeader = async () => {
        const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
        const signature = await signer.signMessage("message");
        const digest = Buffer.from(getBytes(hashMessage("message"))).toString("hex");
        return `Bearer ${cryptoService.encrypt(publicKey, `${signature}:${digest}`)}`;
    };
    beforeAll(async () => {
        [signer] = await hardhat.ethers.getSigners();
        process.env.COORDINATOR_ADDRESSES = await signer.getAddress();
        const vkRegistry = await deployVkRegistryContract({ signer });
        await setVerifyingKeys({
            quiet: true,
            vkRegistry,
            stateTreeDepth: STATE_TREE_DEPTH,
            intStateTreeDepth: INT_STATE_TREE_DEPTH,
            voteOptionTreeDepth: VOTE_OPTION_TREE_DEPTH,
            messageBatchSize: MSG_BATCH_SIZE,
            processMessagesZkeyPathNonQv: path.resolve(__dirname, "../zkeys/ProcessMessagesNonQv_10-20-2_test/ProcessMessagesNonQv_10-20-2_test.0.zkey"),
            tallyVotesZkeyPathNonQv: path.resolve(__dirname, "../zkeys/TallyVotesNonQv_10-1-2_test/TallyVotesNonQv_10-1-2_test.0.zkey"),
            pollJoiningZkeyPath: path.resolve(__dirname, "../zkeys/PollJoining_10_test/PollJoining_10_test.0.zkey"),
            useQuadraticVoting: false,
            signer,
        });
        maciAddresses = await deploy({ stateTreeDepth: 10, signer });
        pollContracts = await deployPoll({
            pollDuration: 30,
            intStateTreeDepth: INT_STATE_TREE_DEPTH,
            messageBatchSize: MSG_BATCH_SIZE,
            voteOptionTreeDepth: VOTE_OPTION_TREE_DEPTH,
            coordinatorPubkey: coordinatorKeypair.pubKey.serialize(),
            useQuadraticVoting: false,
            signer,
        });
        const moduleFixture = await Test.createTestingModule({
            imports: [AppModule, FileModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.listen(3000);
    });
    beforeEach(async () => {
        const authorization = await getAuthorizationHeader();
        await new Promise((resolve) => {
            app.getUrl().then((url) => {
                socket = io(url, {
                    extraHeaders: {
                        authorization,
                    },
                });
                socket.on("connect", () => {
                    resolve(true);
                });
            });
        });
    });
    afterEach(() => {
        socket.disconnect();
    });
    afterAll(async () => {
        await app.close();
    });
    describe("validation /v1/proof/generate POST", () => {
        beforeAll(async () => {
            const user = new Keypair();
            await signup({ maciAddress: maciAddresses.maciAddress, maciPubKey: user.pubKey.serialize(), signer });
            await publish({
                pubkey: user.pubKey.serialize(),
                stateIndex: 1n,
                voteOptionIndex: 0n,
                nonce: 1n,
                pollId: 0n,
                newVoteWeight: 9n,
                maciAddress: maciAddresses.maciAddress,
                salt: 0n,
                privateKey: user.privKey.serialize(),
                signer,
            });
        });
        test("should throw an error if poll id is invalid", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send({
                poll: "-1",
                encryptedCoordinatorPrivateKey,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                error: "Bad Request",
                statusCode: HttpStatus.BAD_REQUEST,
                message: ["poll must not be less than 0", "poll must be an integer number"],
            });
        });
        test("should throw an error if poll id is invalid (ws)", async () => {
            const publicKey = fs.readFileSync(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const args = {
                poll: "-1",
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey,
            };
            const result = await new Promise((resolve) => {
                socket
                    .emit(EProofGenerationEvents.START, args)
                    .on(EProofGenerationEvents.ERROR, (errors) => {
                    const error = errors[0]?.constraints;
                    resolve({ min: error?.min, isInt: error?.isInt });
                });
            });
            expect(result.min).toBe("poll must not be less than 0");
            expect(result.isInt).toBe("poll must be an integer number");
        });
        test("should throw an error if encrypted key is invalid", async () => {
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send({
                poll: 0,
                encryptedCoordinatorPrivateKey: "",
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                error: "Bad Request",
                statusCode: HttpStatus.BAD_REQUEST,
                message: ["encryptedCoordinatorPrivateKey must be longer than or equal to 1 characters"],
            });
        });
        test("should throw an error if encrypted key is invalid (ws)", async () => {
            const args = {
                poll: 0,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey: "",
            };
            const result = await new Promise((resolve) => {
                socket
                    .emit(EProofGenerationEvents.START, args)
                    .on(EProofGenerationEvents.ERROR, (errors) => {
                    const error = errors[0]?.constraints;
                    resolve({ isLength: error?.isLength });
                });
            });
            expect(result.isLength).toBe("encryptedCoordinatorPrivateKey must be longer than or equal to 1 characters");
        });
        test("should throw an error if maci address is invalid", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send({
                poll: 0,
                encryptedCoordinatorPrivateKey,
                maciContractAddress: "wrong",
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                error: "Bad Request",
                statusCode: HttpStatus.BAD_REQUEST,
                message: ["maciContractAddress must be an Ethereum address"],
            });
        });
        test("should throw an error if maci address is invalid (ws)", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const args = {
                poll: 0,
                maciContractAddress: "wrong",
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey,
            };
            const result = await new Promise((resolve) => {
                socket
                    .emit(EProofGenerationEvents.START, args)
                    .on(EProofGenerationEvents.ERROR, (errors) => {
                    const error = errors[0]?.constraints;
                    resolve({ isEthereumAddress: error?.isEthereumAddress });
                });
            });
            expect(result.isEthereumAddress).toBe("maciContractAddress must be an Ethereum address");
        });
        test("should throw an error if tally address is invalid", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send({
                poll: 0,
                encryptedCoordinatorPrivateKey,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: "invalid",
                useQuadraticVoting: false,
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                error: "Bad Request",
                statusCode: HttpStatus.BAD_REQUEST,
                message: ["tallyContractAddress must be an Ethereum address"],
            });
        });
        test("should throw an error if tally address is invalid (ws)", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const args = {
                poll: 0,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: "wrong",
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey,
            };
            const result = await new Promise((resolve) => {
                socket
                    .emit(EProofGenerationEvents.START, args)
                    .on(EProofGenerationEvents.ERROR, (errors) => {
                    const error = errors[0]?.constraints;
                    resolve({ isEthereumAddress: error?.isEthereumAddress });
                });
            });
            expect(result.isEthereumAddress).toBe("tallyContractAddress must be an Ethereum address");
        });
    });
    describe("validation /v1/subgraph/deploy POST", () => {
        test("should throw an error if network is invalid", async () => {
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/subgraph/deploy")
                .set("Authorization", encryptedHeader)
                .send({
                network: "unknown",
                maciContractAddress: maciAddresses.maciAddress,
                startBlock: 0,
                name: "subgraph",
                tag: "v0.0.1",
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                error: "Bad Request",
                statusCode: HttpStatus.BAD_REQUEST,
                message: [`network must be one of the following values: ${Object.values(ESupportedNetworks).join(", ")}`],
            });
        });
        test("should throw an error if network is invalid (ws)", async () => {
            const args = {
                network: "unknown",
                maciContractAddress: maciAddresses.maciAddress,
                startBlock: 0,
                name: "subgraph",
                tag: "v0.0.1",
            };
            const result = await new Promise((resolve) => {
                socket.emit(ESubgraphEvents.START, args).on(ESubgraphEvents.ERROR, (errors) => {
                    const error = errors[0]?.constraints;
                    resolve({ network: error?.isEnum });
                });
            });
            expect(result.network).toBe(`network must be one of the following values: ${Object.values(ESupportedNetworks).join(", ")}`);
        });
        test("should throw an error if maci contract is invalid", async () => {
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/subgraph/deploy")
                .set("Authorization", encryptedHeader)
                .send({
                network: ESupportedNetworks.OPTIMISM_SEPOLIA,
                maciContractAddress: "unknown",
                startBlock: 0,
                name: "subgraph",
                tag: "v0.0.1",
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                error: "Bad Request",
                statusCode: HttpStatus.BAD_REQUEST,
                message: ["maciContractAddress must be an Ethereum address"],
            });
        });
        test("should throw an error if maci contract is invalid (ws)", async () => {
            const args = {
                network: ESupportedNetworks.OPTIMISM_SEPOLIA,
                maciContractAddress: "unknown",
                startBlock: 0,
                name: "subgraph",
                tag: "v0.0.1",
            };
            const result = await new Promise((resolve) => {
                socket.emit(ESubgraphEvents.START, args).on(ESubgraphEvents.ERROR, (errors) => {
                    const error = errors[0]?.constraints;
                    resolve({ contract: error?.isEthereumAddress });
                });
            });
            expect(result.contract).toBe("maciContractAddress must be an Ethereum address");
        });
        test("should throw an error if tag is invalid", async () => {
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/subgraph/deploy")
                .set("Authorization", encryptedHeader)
                .send({
                network: ESupportedNetworks.OPTIMISM_SEPOLIA,
                maciContractAddress: maciAddresses.maciAddress,
                startBlock: 0,
                name: "subgraph",
                tag: "unknown",
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                error: "Bad Request",
                statusCode: HttpStatus.BAD_REQUEST,
                message: ["tag must match /^v\\d+\\.\\d+\\.\\d+$/ regular expression"],
            });
        });
        test("should throw an error if tag is invalid (ws)", async () => {
            const args = {
                network: ESupportedNetworks.OPTIMISM_SEPOLIA,
                maciContractAddress: maciAddresses.maciAddress,
                startBlock: 0,
                name: "subgraph",
                tag: "unknown",
            };
            const result = await new Promise((resolve) => {
                socket.emit(ESubgraphEvents.START, args).on(ESubgraphEvents.ERROR, (errors) => {
                    const error = errors[0]?.constraints;
                    resolve({ tag: error?.matches });
                });
            });
            expect(result.tag).toBe("tag must match /^v\\d+\\.\\d+\\.\\d+$/ regular expression");
        });
    });
    describe("/v1/subgraph/deploy POST", () => {
        test("should throw an error if there is no authorization header", async () => {
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .send({
                network: ESupportedNetworks.OPTIMISM_SEPOLIA,
                maciContractAddress: maciAddresses.maciAddress,
                startBlock: 0,
                name: "subgraph",
                tag: "v0.0.1",
            })
                .expect(403);
            expect(result.body).toStrictEqual({
                error: "Forbidden",
                message: "Forbidden resource",
                statusCode: HttpStatus.FORBIDDEN,
            });
        });
        test("should throw an error if there is no authorization header (ws)", async () => {
            const args = {
                network: ESupportedNetworks.OPTIMISM_SEPOLIA,
                maciContractAddress: maciAddresses.maciAddress,
                startBlock: 0,
                name: "subgraph",
                tag: "v0.0.1",
            };
            const unauthorizedSocket = io(await app.getUrl());
            const result = await new Promise((resolve) => {
                unauthorizedSocket.emit(ESubgraphEvents.START, args).on(ESubgraphEvents.ERROR, (error) => {
                    resolve(error);
                });
            }).finally(() => unauthorizedSocket.disconnect());
            expect(result.message).toBe("Forbidden resource");
        });
    });
    describe("/v1/proof/publicKey GET", () => {
        test("should get public key properly", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const result = await request(app.getHttpServer())
                .get("/v1/proof/publicKey")
                .expect(200);
            expect(result.body).toStrictEqual({ publicKey: publicKey.toString() });
        });
    });
    describe("/v1/proof/generate POST", () => {
        beforeAll(async () => {
            const user = new Keypair();
            await signup({ maciAddress: maciAddresses.maciAddress, maciPubKey: user.pubKey.serialize(), signer });
            await publish({
                pubkey: user.pubKey.serialize(),
                stateIndex: 1n,
                voteOptionIndex: 0n,
                nonce: 1n,
                pollId: 0n,
                newVoteWeight: 9n,
                maciAddress: maciAddresses.maciAddress,
                salt: 0n,
                privateKey: user.privKey.serialize(),
                signer,
            });
        });
        test("should throw an error if poll is not over", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send({
                poll: 0,
                encryptedCoordinatorPrivateKey,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ErrorCodes.NOT_MERGED_STATE_TREE.toString(),
            });
        });
        test("should throw an error if poll is not over (ws)", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const args = {
                poll: 0,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey,
            };
            const result = await new Promise((resolve) => {
                socket.emit(EProofGenerationEvents.START, args).on(EProofGenerationEvents.ERROR, (error) => {
                    resolve(error);
                });
            });
            expect(result.message).toBe(ErrorCodes.NOT_MERGED_STATE_TREE.toString());
        });
        test("should throw an error if signups are not merged", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send({
                poll: 0,
                encryptedCoordinatorPrivateKey,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ErrorCodes.NOT_MERGED_STATE_TREE.toString(),
            });
        });
        test("should throw an error if signups are not merged (ws)", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const args = {
                poll: 0,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey,
            };
            const result = await new Promise((resolve) => {
                socket.emit(EProofGenerationEvents.START, args).on(EProofGenerationEvents.ERROR, (error) => {
                    resolve(error);
                });
            });
            expect(result.message).toBe(ErrorCodes.NOT_MERGED_STATE_TREE.toString());
        });
        test("should throw an error if coordinator key decryption is failed", async () => {
            const pollContract = PollFactory.connect(pollContracts.poll, signer);
            const isStateMerged = await pollContract.stateMerged();
            if (!isStateMerged) {
                await timeTravel({ seconds: 30, signer });
                await mergeSignups({ pollId: 0n, signer });
            }
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send({
                poll: 0,
                encryptedCoordinatorPrivateKey: coordinatorKeypair.privKey.serialize(),
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ErrorCodes.DECRYPTION.toString(),
            });
        });
        test("should throw an error if coordinator key decryption is failed (ws)", async () => {
            const pollContract = PollFactory.connect(pollContracts.poll, signer);
            const isStateMerged = await pollContract.stateMerged();
            if (!isStateMerged) {
                await timeTravel({ seconds: 30, signer });
                await mergeSignups({ pollId: 0n, signer });
            }
            const args = {
                poll: 0,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey: coordinatorKeypair.privKey.serialize(),
            };
            const result = await new Promise((resolve) => {
                socket.emit(EProofGenerationEvents.START, args).on(EProofGenerationEvents.ERROR, (error) => {
                    resolve(error);
                });
            });
            expect(result.message).toBe(ErrorCodes.DECRYPTION.toString());
        });
        test("should throw an error if there is no such poll", async () => {
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send({
                poll: 9000,
                encryptedCoordinatorPrivateKey: coordinatorKeypair.privKey.serialize(),
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ErrorCodes.POLL_NOT_FOUND.toString(),
            });
        });
        test("should throw an error if there is no such poll (ws)", async () => {
            const args = {
                poll: 9000,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey: coordinatorKeypair.privKey.serialize(),
            };
            const result = await new Promise((resolve) => {
                socket.emit(EProofGenerationEvents.START, args).on(EProofGenerationEvents.ERROR, (error) => {
                    resolve(error);
                });
            });
            expect(result.message).toBe(ErrorCodes.POLL_NOT_FOUND.toString());
        });
        test("should throw an error if there is no authorization header", async () => {
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .send({
                poll: 0,
                encryptedCoordinatorPrivateKey: coordinatorKeypair.privKey.serialize(),
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            })
                .expect(403);
            expect(result.body).toStrictEqual({
                error: "Forbidden",
                message: "Forbidden resource",
                statusCode: HttpStatus.FORBIDDEN,
            });
        });
        test("should throw an error if there is no authorization header (ws)", async () => {
            const args = {
                poll: 0,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey: coordinatorKeypair.privKey.serialize(),
            };
            const unauthorizedSocket = io(await app.getUrl());
            const result = await new Promise((resolve) => {
                unauthorizedSocket.emit(EProofGenerationEvents.START, args).on(EProofGenerationEvents.ERROR, (error) => {
                    resolve(error);
                });
            }).finally(() => unauthorizedSocket.disconnect());
            expect(result.message).toBe("Forbidden resource");
        });
        test("should throw error if coordinator key cannot be decrypted", async () => {
            const encryptedHeader = await getAuthorizationHeader();
            const result = await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send({
                poll: 0,
                encryptedCoordinatorPrivateKey: "unknown",
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            })
                .expect(400);
            expect(result.body).toStrictEqual({
                statusCode: HttpStatus.BAD_REQUEST,
                message: ErrorCodes.DECRYPTION.toString(),
            });
        });
        test("should throw error if coordinator key cannot be decrypted (ws)", async () => {
            const args = {
                poll: 0,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
                encryptedCoordinatorPrivateKey: "unknown",
            };
            const result = await new Promise((resolve) => {
                socket.emit(EProofGenerationEvents.START, args).on(EProofGenerationEvents.ERROR, (error) => {
                    resolve(error);
                });
            });
            expect(result.message).toBe(ErrorCodes.DECRYPTION.toString());
        });
        test("should generate proofs properly", async () => {
            const publicKey = await fs.promises.readFile(process.env.COORDINATOR_PUBLIC_KEY_PATH);
            const encryptedCoordinatorPrivateKey = cryptoService.encrypt(publicKey, coordinatorKeypair.privKey.serialize());
            const encryptedHeader = await getAuthorizationHeader();
            const args = {
                poll: 0,
                encryptedCoordinatorPrivateKey,
                maciContractAddress: maciAddresses.maciAddress,
                tallyContractAddress: pollContracts.tally,
                useQuadraticVoting: false,
            };
            await request(app.getHttpServer())
                .post("/v1/proof/generate")
                .set("Authorization", encryptedHeader)
                .send(args)
                .expect(201);
            const proofData = await Promise.all([
                fs.promises.readFile("./proofs/process_0.json"),
                fs.promises.readFile("./proofs/tally_0.json"),
                fs.promises.readFile("./tally.json"),
            ])
                .then((files) => files.map((item) => JSON.parse(item.toString())))
                .then((data) => ({
                processProofs: [data[0]],
                tallyProofs: [data[1]],
                tallyData: data[2],
            }));
            const result = await new Promise((resolve) => {
                socket.emit(EProofGenerationEvents.START, args).on(EProofGenerationEvents.FINISH, ({ tallyData }) => {
                    if (tallyData) {
                        resolve(tallyData);
                    }
                });
            });
            expect(proofData.processProofs).toHaveLength(1);
            expect(proofData.tallyProofs).toHaveLength(1);
            expect(proofData.tallyData).toBeDefined();
            expect(result.results.tally).toStrictEqual(proofData.tallyData.results.tally);
        });
    });
});
