var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { CryptoModule } from "./crypto/crypto.module";
import { FileModule } from "./file/file.module";
import { ProofModule } from "./proof/proof.module";
import { SessionKeysModule } from "./sessionKeys/sessionKeys.module";
import { SubgraphModule } from "./subgraph/subgraph.module";
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            ThrottlerModule.forRoot([
                {
                    ttl: Number(process.env.TTL),
                    limit: Number(process.env.LIMIT),
                },
            ]),
            FileModule,
            CryptoModule,
            SubgraphModule,
            ProofModule,
            SessionKeysModule,
        ],
    })
], AppModule);
export { AppModule };
