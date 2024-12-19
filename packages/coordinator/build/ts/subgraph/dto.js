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
import { IsEnum, IsEthereumAddress, IsInt, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";
import { ESupportedNetworks, transformToString } from "../common";
/**
 * Data transfer object for deploying subgraph
 */
export class DeploySubgraphDto {
    /**
     * MACI contract address
     */
    maciContractAddress;
    /**
     * Start block for event processing
     */
    startBlock;
    /**
     * Network CLI name
     */
    network;
    /**
     * Subgraph name
     */
    name;
    /**
     * Version tag (ex: v0.0.1)
     */
    tag;
}
__decorate([
    ApiProperty({
        description: "MACI contract address",
        type: String,
    }),
    IsEthereumAddress(),
    __metadata("design:type", String)
], DeploySubgraphDto.prototype, "maciContractAddress", void 0);
__decorate([
    ApiProperty({
        description: "Start block for event parsing",
        minimum: 0,
        type: Number,
    }),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], DeploySubgraphDto.prototype, "startBlock", void 0);
__decorate([
    ApiProperty({
        description: "Network CLI name (https://thegraph.com/docs/en/developing/supported-networks/)",
        enum: ESupportedNetworks,
    }),
    IsEnum(ESupportedNetworks),
    Transform(transformToString),
    __metadata("design:type", String)
], DeploySubgraphDto.prototype, "network", void 0);
__decorate([
    ApiProperty({
        description: "Subgraph name",
        type: String,
    }),
    IsString(),
    MinLength(3),
    MaxLength(50),
    __metadata("design:type", String)
], DeploySubgraphDto.prototype, "name", void 0);
__decorate([
    ApiProperty({
        description: "Version tag (ex: v0.0.1)",
        type: String,
    }),
    IsString(),
    Matches(/^v\d+\.\d+\.\d+$/),
    __metadata("design:type", String)
], DeploySubgraphDto.prototype, "tag", void 0);
