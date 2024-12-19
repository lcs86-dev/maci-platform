var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ProofGateway_1;
import { Logger, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { AccountSignatureGuard } from "../auth/AccountSignatureGuard.service";
import { GenerateProofDto } from "./dto";
import { ProofGeneratorService } from "./proof.service";
import { EProofGenerationEvents } from "./types";
/**
 * ProofGateway is responsible for websockets integration between client and ProofGeneratorService.
 */
let ProofGateway = ProofGateway_1 = class ProofGateway {
    proofGeneratorService;
    /**
     * Logger
     */
    logger = new Logger(ProofGateway_1.name);
    /**
     * Websocket server
     */
    server;
    /**
     * Initialize ProofGateway
     *
     * @param proofGeneratorService - proof generator service
     */
    constructor(proofGeneratorService) {
        this.proofGeneratorService = proofGeneratorService;
    }
    /**
     * Generate proofs api method.
     * Events:
     * 1. EProofGenerationEvents.START - trigger method call
     * 2. EProofGenerationEvents.PROGRESS - returns generated proofs with batch info
     * 3. EProofGenerationEvents.FINISH - returns generated proofs and tally data when available
     * 4. EProofGenerationEvents.ERROR - triggered when exception is thrown
     *
     * @param args - generate proof dto
     */
    async generate(data) {
        await this.proofGeneratorService.generate(data, {
            onBatchComplete: (result) => {
                this.server.emit(EProofGenerationEvents.PROGRESS, result);
            },
            onComplete: (proofs, tallyData) => {
                this.server.emit(EProofGenerationEvents.FINISH, { proofs, tallyData });
            },
            onFail: (error) => {
                this.logger.error(`Error:`, error);
                this.server.emit(EProofGenerationEvents.ERROR, { message: error.message });
            },
        });
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Function)
], ProofGateway.prototype, "server", void 0);
__decorate([
    SubscribeMessage(EProofGenerationEvents.START),
    UsePipes(new ValidationPipe({
        transform: true,
        exceptionFactory(validationErrors) {
            return new WsException(validationErrors);
        },
    })),
    __param(0, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateProofDto]),
    __metadata("design:returntype", Promise)
], ProofGateway.prototype, "generate", null);
ProofGateway = ProofGateway_1 = __decorate([
    WebSocketGateway({
        cors: {
            origin: process.env.COORDINATOR_ALLOWED_ORIGINS?.split(","),
        },
    }),
    UseGuards(AccountSignatureGuard),
    __metadata("design:paramtypes", [ProofGeneratorService])
], ProofGateway);
export { ProofGateway };
