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
/* eslint-disable @typescript-eslint/no-shadow */
import { Body, Controller, Delete, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AccountSignatureGuard } from "../auth/AccountSignatureGuard.service";
import { DeactivateSessionKeyDto } from "./dto";
import { SessionKeysService } from "./sessionKeys.service";
let SessionKeysController = class SessionKeysController {
    sessionKeysService;
    /**
     * Initialize SessionKeysController
     *
     * @param sessionKeysService - session keys service
     */
    constructor(sessionKeysService) {
        this.sessionKeysService = sessionKeysService;
    }
    /**
     * Generate a session key api method
     *
     * @returns generated session key address
     */
    async generateSessionKey() {
        return Promise.resolve(this.sessionKeysService.generateSessionKey());
    }
    /**
     * Delete a session key api method
     *
     * @param args - delete session key dto
     * @returns deleted session key address
     */
    deactivateSessionKey(args) {
        this.sessionKeysService.deactivateSessionKey(args.sessionKeyAddress);
    }
};
__decorate([
    ApiResponse({ status: HttpStatus.CREATED, description: "The session key was successfully generated" }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden" }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" }),
    Get("generate"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SessionKeysController.prototype, "generateSessionKey", null);
__decorate([
    ApiBody({ type: DeactivateSessionKeyDto }),
    ApiResponse({ status: HttpStatus.CREATED, description: "The session key was successfully deactivated" }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: "Forbidden" }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "BadRequest" }),
    Delete("delete"),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DeactivateSessionKeyDto]),
    __metadata("design:returntype", void 0)
], SessionKeysController.prototype, "deactivateSessionKey", null);
SessionKeysController = __decorate([
    ApiTags("v1/session-keys"),
    ApiBearerAuth(),
    Controller("v1/session-keys"),
    UseGuards(AccountSignatureGuard),
    __metadata("design:paramtypes", [SessionKeysService])
], SessionKeysController);
export { SessionKeysController };
