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
import { IsBoolean, IsEthereumAddress, IsInt, IsOptional, IsString, Length, Max, Min } from "class-validator";
/**
 * Data transfer object for generate proof
 */
export class GenerateProofDto {
    /**
     * Poll id
     */
    poll;
    /**
     * Maci contract address
     */
    maciContractAddress;
    /**
     * Tally contract address
     */
    tallyContractAddress;
    /**
     * Whether to use Qv or NonQv
     */
    useQuadraticVoting;
    /**
     * Encrypted coordinator private key with RSA public key (see .env.example)
     */
    encryptedCoordinatorPrivateKey;
    /**
     * Start block for event processing
     */
    startBlock;
    /**
     * End block for event processing
     */
    endBlock;
    /**
     * Blocks per batch for event processing
     */
    blocksPerBatch;
}
__decorate([
    ApiProperty({
        description: "Poll id",
        minimum: 0,
        type: Number,
    }),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], GenerateProofDto.prototype, "poll", void 0);
__decorate([
    ApiProperty({
        description: "MACI contract address",
        type: String,
    }),
    IsEthereumAddress(),
    __metadata("design:type", String)
], GenerateProofDto.prototype, "maciContractAddress", void 0);
__decorate([
    ApiProperty({
        description: "Tally contract address",
        type: String,
    }),
    IsEthereumAddress(),
    __metadata("design:type", String)
], GenerateProofDto.prototype, "tallyContractAddress", void 0);
__decorate([
    ApiProperty({
        description: "Whether to use quadratic voting or not",
        type: Boolean,
    }),
    IsBoolean(),
    __metadata("design:type", Boolean)
], GenerateProofDto.prototype, "useQuadraticVoting", void 0);
__decorate([
    ApiProperty({
        description: "Encrypted coordinator private key with RSA public key (see README.md)",
        minimum: 1,
        maximum: 1024,
        type: String,
    }),
    IsString(),
    Length(1, 1024),
    __metadata("design:type", String)
], GenerateProofDto.prototype, "encryptedCoordinatorPrivateKey", void 0);
__decorate([
    ApiProperty({
        description: "Start block for event parsing",
        minimum: 0,
        type: Number,
    }),
    IsInt(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], GenerateProofDto.prototype, "startBlock", void 0);
__decorate([
    ApiProperty({
        description: "End block for event parsing",
        minimum: 0,
        type: Number,
    }),
    IsInt(),
    Min(0),
    IsOptional(),
    __metadata("design:type", Number)
], GenerateProofDto.prototype, "endBlock", void 0);
__decorate([
    ApiProperty({
        description: "Blocks per batch for event parsing",
        minimum: 1,
        maximum: 1000,
        type: Number,
    }),
    IsInt(),
    Min(1),
    Max(1000),
    IsOptional(),
    __metadata("design:type", Number)
], GenerateProofDto.prototype, "blocksPerBatch", void 0);
/**
 * Data transfer object for merge trees
 */
export class MergeTreesDto {
    /**
     * Poll id
     */
    poll;
    maciContractAddress;
    sessionKeyAddress;
    approval;
}
__decorate([
    ApiProperty({
        description: "Poll id",
        minimum: 0,
        type: Number,
    }),
    IsInt(),
    Min(0),
    __metadata("design:type", Number)
], MergeTreesDto.prototype, "poll", void 0);
__decorate([
    ApiProperty({
        description: "MACI contract address",
        type: String,
    }),
    IsEthereumAddress(),
    __metadata("design:type", String)
], MergeTreesDto.prototype, "maciContractAddress", void 0);
__decorate([
    ApiProperty({
        description: "Session key address",
        type: String,
    }),
    IsEthereumAddress(),
    __metadata("design:type", String)
], MergeTreesDto.prototype, "sessionKeyAddress", void 0);
__decorate([
    ApiProperty({
        description: "Approval",
        type: String,
    }),
    IsString(),
    __metadata("design:type", String)
], MergeTreesDto.prototype, "approval", void 0);
