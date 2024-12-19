var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEnum, IsEthereumAddress } from "class-validator";
import { ESupportedNetworks, transformToString } from "../common";
/**
 * Data transfer object for Deactivate session key
 */
export class DeactivateSessionKeyDto {
    /**
     * Session key address
     */
    sessionKeyAddress;
    /**
     * Chain Name
     */
    chain;
}
__decorate([
    ApiProperty({
        description: "Session key address",
        type: String,
    }),
    IsEthereumAddress(),
    __metadata("design:type", String)
], DeactivateSessionKeyDto.prototype, "sessionKeyAddress", void 0);
__decorate([
    ApiProperty({
        description: "Chain to which to deploy the contract(s)",
        enum: ESupportedNetworks,
    }),
    IsEnum(ESupportedNetworks),
    Transform(transformToString),
    __metadata("design:type", String)
], DeactivateSessionKeyDto.prototype, "chain", void 0);
