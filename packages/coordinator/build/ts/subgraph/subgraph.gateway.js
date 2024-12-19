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
var SubgraphGateway_1;
import { Logger, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { AccountSignatureGuard } from "../auth/AccountSignatureGuard.service";
import { DeploySubgraphDto } from "./dto";
import { SubgraphService } from "./subgraph.service";
import { ESubgraphEvents } from "./types";
/**
 * SubgraphGateway is responsible for websockets integration between client and SubgraphService.
 */
let SubgraphGateway = SubgraphGateway_1 = class SubgraphGateway {
    subgraphService;
    /**
     * Logger
     */
    logger = new Logger(SubgraphGateway_1.name);
    /**
     * Websocket server
     */
    server;
    /**
     * Initialize SubgraphGateway
     *
     * @param subgraphService - subgraph service
     */
    constructor(subgraphService) {
        this.subgraphService = subgraphService;
    }
    /**
     * Generate proofs api method.
     * Events:
     * 1. ESubgraphEvents.START - trigger method call
     * 2. ESubgraphEvents.PROGRESS - returns deployed steps info
     * 3. ESubgraphEvents.FINISH - returns result of deploy operation
     * 4. ESubgraphEvents.ERROR - triggered when exception is thrown
     *
     * @param args - generate proof dto
     */
    async deploy(data) {
        await this.subgraphService.deploy(data, {
            onProgress: (result) => {
                this.server.emit(ESubgraphEvents.PROGRESS, result);
            },
            onSuccess: (url) => {
                this.server.emit(ESubgraphEvents.FINISH, { url });
            },
            onFail: (error) => {
                this.logger.error(`Error:`, error);
                this.server.emit(ESubgraphEvents.ERROR, { message: error.message });
            },
        });
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Function)
], SubgraphGateway.prototype, "server", void 0);
__decorate([
    SubscribeMessage(ESubgraphEvents.START),
    UsePipes(new ValidationPipe({
        transform: true,
        exceptionFactory(validationErrors) {
            return new WsException(validationErrors);
        },
    })),
    __param(0, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DeploySubgraphDto]),
    __metadata("design:returntype", Promise)
], SubgraphGateway.prototype, "deploy", null);
SubgraphGateway = SubgraphGateway_1 = __decorate([
    WebSocketGateway({
        cors: {
            origin: process.env.COORDINATOR_ALLOWED_ORIGINS?.split(","),
        },
    }),
    UseGuards(AccountSignatureGuard),
    __metadata("design:paramtypes", [SubgraphService])
], SubgraphGateway);
export { SubgraphGateway };
