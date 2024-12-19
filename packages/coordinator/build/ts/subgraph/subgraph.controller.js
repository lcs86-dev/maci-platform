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
var SubgraphController_1;
/* eslint-disable @typescript-eslint/no-shadow */
import { Body, Controller, HttpException, HttpStatus, Logger, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DeploySubgraphDto } from "./dto";
import { SubgraphService } from "./subgraph.service";
let SubgraphController = SubgraphController_1 = class SubgraphController {
    subgraphService;
    /**
     * Logger
     */
    logger = new Logger(SubgraphController_1.name);
    /**
     * Initialize SubgraphController
     *
     * @param subgraphService - subgraph service
     */
    constructor(subgraphService) {
        this.subgraphService = subgraphService;
    }
    /**
     * Generate proofs api method
     *
     * @param args - generate proof dto
     * @returns generated proofs and tally data
     */
    async deploy(args) {
        return this.subgraphService.deploy(args).catch((error) => {
            this.logger.error(`Error:`, error);
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        });
    }
};
__decorate([
    ApiBody({ type: DeploySubgraphDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: "The subgraph was successfully deployed" }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden" }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" }),
    Post("deploy"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DeploySubgraphDto]),
    __metadata("design:returntype", Promise)
], SubgraphController.prototype, "deploy", null);
SubgraphController = SubgraphController_1 = __decorate([
    ApiTags("v1/subgraph"),
    ApiBearerAuth(),
    Controller("v1/subgraph")
    // @UseGuards(AccountSignatureGuard)
    ,
    __metadata("design:paramtypes", [SubgraphService])
], SubgraphController);
export { SubgraphController };
