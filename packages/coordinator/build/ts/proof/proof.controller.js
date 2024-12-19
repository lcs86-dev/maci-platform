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
var ProofController_1;
/* eslint-disable @typescript-eslint/no-shadow */
import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AccountSignatureGuard, Public } from "../auth/AccountSignatureGuard.service";
import { FileService } from "../file/file.service";
import { GenerateProofDto, MergeTreesDto } from "./dto";
import { ProofGeneratorService } from "./proof.service";
let ProofController = ProofController_1 = class ProofController {
    proofGeneratorService;
    fileService;
    /**
     * Logger
     */
    logger = new Logger(ProofController_1.name);
    /**
     * Initialize ProofController
     *
     * @param proofGeneratorService - proof generator service
     * @param fileService - file service
     */
    constructor(proofGeneratorService, fileService) {
        this.proofGeneratorService = proofGeneratorService;
        this.fileService = fileService;
    }
    /**
     * Generate proofs api method
     *
     * @param args - generate proof dto
     * @returns generated proofs and tally data
     */
    async generate(args) {
        return this.proofGeneratorService.generate(args).catch((error) => {
            this.logger.error(`Error:`, error);
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        });
    }
    /**
     * Merge trees api method
     *
     * @param args - merge args
     * @returns whether the trees were successfully merged
     */
    async merge(args) {
        return this.proofGeneratorService.merge(args).catch((error) => {
            this.logger.error(`Error:`, error);
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        });
    }
    /**
     * Get RSA public key for authorization setup
     *
     * @returns RSA public key
     */
    async getPublicKey() {
        return this.fileService.getPublicKey().catch((error) => {
            this.logger.error(`Error:`, error);
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        });
    }
};
__decorate([
    ApiBody({ type: GenerateProofDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: "The proofs have been successfully generated" }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden" }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" }),
    Post("generate"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateProofDto]),
    __metadata("design:returntype", Promise)
], ProofController.prototype, "generate", null);
__decorate([
    ApiBody({ type: MergeTreesDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: "The proofs have been successfully merged" }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden" }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" }),
    Post("merge"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProofController.prototype, "merge", null);
__decorate([
    ApiResponse({ status: HttpStatus.OK, description: "Public key was successfully returned" }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" }),
    Public(),
    Get("publicKey"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProofController.prototype, "getPublicKey", null);
ProofController = ProofController_1 = __decorate([
    ApiTags("v1/proof"),
    ApiBearerAuth(),
    Controller("v1/proof"),
    UseGuards(AccountSignatureGuard),
    __metadata("design:paramtypes", [ProofGeneratorService,
        FileService])
], ProofController);
export { ProofController };
