var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SubgraphService_1;
import { Injectable, Logger } from "@nestjs/common";
import childProcess from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { ErrorCodes, ESupportedNetworks } from "../common";
import { EProgressStep, TOTAL_STEPS, } from "./types";
const execFile = promisify(childProcess.execFile);
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
/**
 * SubgraphService is responsible for deploying subgraph.
 */
let SubgraphService = SubgraphService_1 = class SubgraphService {
    /**
     * Logger
     */
    logger = new Logger(SubgraphService_1.name);
    /**
     * Generate proofs for message processing and tally
     *
     * @param args - deploy subgraph arguments
     * @param options - ws hooks
     * @returns - deployed subgraph url
     * @throws error if deploy is not successful
     */
    async deploy(args, options) {
        try {
            if (!Object.values(ESupportedNetworks).includes(args.network)) {
                throw new Error("Invalid network");
            }
            const subgraphManifestPath = path.resolve(process.env.SUBGRAPH_FOLDER, "subgraph.yaml");
            await execFile("cp", [
                path.resolve(process.env.SUBGRAPH_FOLDER, "schemas/schema.v1.graphql"),
                path.resolve(process.env.SUBGRAPH_FOLDER, "schema.graphql"),
            ]);
            options?.onProgress({ current: EProgressStep.SCHEMA, total: TOTAL_STEPS });
            await fs.promises.writeFile(path.resolve(process.env.SUBGRAPH_FOLDER, `config/${args.network}.json`), `${JSON.stringify({
                network: args.network,
                maciContractAddress: args.maciContractAddress,
                maciContractStartBlock: args.startBlock,
            }, null, 2)}\n`, { flag: "w+" });
            options?.onProgress({ current: EProgressStep.NETWORK, total: TOTAL_STEPS });
            const mustacheOutput = await execFile("mustache", [
                path.resolve(process.env.SUBGRAPH_FOLDER, `config/${args.network}.json`),
                path.resolve(process.env.SUBGRAPH_FOLDER, "templates/subgraph.template.yaml"),
            ]);
            await fs.promises.writeFile(subgraphManifestPath, mustacheOutput.stdout, { flag: "w+" });
            options?.onProgress({ current: EProgressStep.TEMPLATE, total: TOTAL_STEPS });
            await execFile("graph", [
                "codegen",
                subgraphManifestPath,
                "--output-dir",
                path.resolve(process.env.SUBGRAPH_FOLDER, "generated"),
            ]);
            options?.onProgress({ current: EProgressStep.CODEGEN, total: TOTAL_STEPS });
            await execFile("graph", [
                "build",
                subgraphManifestPath,
                "--output-dir",
                path.resolve(process.env.SUBGRAPH_FOLDER, "build"),
            ]);
            options?.onProgress({ current: EProgressStep.BUILD, total: TOTAL_STEPS });
            const deployOutput = await execFile("graph", [
                "deploy",
                process.env.SUBGRAPH_NAME,
                subgraphManifestPath,
                "--node",
                process.env.SUBGRAPH_PROVIDER_URL,
                "--deploy-key",
                process.env.SUBGRAPH_DEPLOY_KEY,
                "--version-label",
                args.tag,
            ]);
            options?.onProgress({ current: EProgressStep.DEPLOY, total: TOTAL_STEPS });
            this.logger.log(deployOutput.stdout);
            const url = deployOutput.stdout.match(URL_REGEX)?.[1]?.trim().replace("\u001b[0m", "");
            if (!url) {
                throw new Error(ErrorCodes.SUBGRAPH_DEPLOY.toString());
            }
            options?.onSuccess(url);
            return { url };
        }
        catch (error) {
            this.logger.error("Error: ", error);
            options?.onFail(error);
            throw new Error(ErrorCodes.SUBGRAPH_DEPLOY.toString());
        }
    }
};
SubgraphService = SubgraphService_1 = __decorate([
    Injectable()
], SubgraphService);
export { SubgraphService };
