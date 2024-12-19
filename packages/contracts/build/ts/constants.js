"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERegistryManagerRequestStatus = exports.ERegistryManagerRequestType = void 0;
/**
 * Enum representing request type
 */
var ERegistryManagerRequestType;
(function (ERegistryManagerRequestType) {
    ERegistryManagerRequestType[ERegistryManagerRequestType["Add"] = 0] = "Add";
    ERegistryManagerRequestType[ERegistryManagerRequestType["Change"] = 1] = "Change";
    ERegistryManagerRequestType[ERegistryManagerRequestType["Remove"] = 2] = "Remove";
})(ERegistryManagerRequestType || (exports.ERegistryManagerRequestType = ERegistryManagerRequestType = {}));
/**
 * Enum representing request status
 */
var ERegistryManagerRequestStatus;
(function (ERegistryManagerRequestStatus) {
    ERegistryManagerRequestStatus[ERegistryManagerRequestStatus["Pending"] = 0] = "Pending";
    ERegistryManagerRequestStatus[ERegistryManagerRequestStatus["Approved"] = 1] = "Approved";
    ERegistryManagerRequestStatus[ERegistryManagerRequestStatus["Rejected"] = 2] = "Rejected";
})(ERegistryManagerRequestStatus || (exports.ERegistryManagerRequestStatus = ERegistryManagerRequestStatus = {}));
