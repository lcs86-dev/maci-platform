import { Test } from "@nestjs/testing";
import { zeroAddress } from "viem";
import { ESupportedNetworks } from "../../common";
import { SessionKeysController } from "../sessionKeys.controller";
import { SessionKeysService } from "../sessionKeys.service";
describe("SessionKeysController", () => {
    let sessionKeysController;
    const mockSessionKeysService = {
        generateSessionKey: jest.fn(),
        deactivateSessionKey: jest.fn(),
    };
    const defaultGenerateSessionKeyReturn = {
        sessionKeyAddress: zeroAddress,
    };
    beforeEach(async () => {
        const app = await Test.createTestingModule({
            controllers: [SessionKeysController],
        })
            .useMocker((token) => {
            if (token === SessionKeysService) {
                mockSessionKeysService.generateSessionKey.mockResolvedValue(defaultGenerateSessionKeyReturn);
                return mockSessionKeysService;
            }
            return jest.fn();
        })
            .compile();
        sessionKeysController = app.get(SessionKeysController);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("v1/session-keys/generate", () => {
        test("should return a session key address", async () => {
            const data = await sessionKeysController.generateSessionKey();
            expect(data).toStrictEqual(defaultGenerateSessionKeyReturn);
        });
    });
    describe("v1/session-keys/delete", () => {
        test("should delete a session key", () => {
            sessionKeysController.deactivateSessionKey({
                sessionKeyAddress: zeroAddress,
                chain: ESupportedNetworks.OPTIMISM_SEPOLIA,
            });
            expect(mockSessionKeysService.deactivateSessionKey).toHaveBeenCalledWith(zeroAddress);
        });
    });
});
