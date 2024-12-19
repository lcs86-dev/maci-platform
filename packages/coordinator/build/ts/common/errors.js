/**
 * Error codes that are used for api responses
 */
export var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes[ErrorCodes["NOT_MERGED_STATE_TREE"] = 0] = "NOT_MERGED_STATE_TREE";
    ErrorCodes[ErrorCodes["PRIVATE_KEY_MISMATCH"] = 1] = "PRIVATE_KEY_MISMATCH";
    ErrorCodes[ErrorCodes["POLL_NOT_FOUND"] = 2] = "POLL_NOT_FOUND";
    ErrorCodes[ErrorCodes["DECRYPTION"] = 3] = "DECRYPTION";
    ErrorCodes[ErrorCodes["ENCRYPTION"] = 4] = "ENCRYPTION";
    ErrorCodes[ErrorCodes["FILE_NOT_FOUND"] = 5] = "FILE_NOT_FOUND";
    ErrorCodes[ErrorCodes["SUBGRAPH_DEPLOY"] = 6] = "SUBGRAPH_DEPLOY";
    ErrorCodes[ErrorCodes["SESSION_KEY_NOT_FOUND"] = 7] = "SESSION_KEY_NOT_FOUND";
    ErrorCodes[ErrorCodes["PIMLICO_API_KEY_NOT_SET"] = 8] = "PIMLICO_API_KEY_NOT_SET";
    ErrorCodes[ErrorCodes["INVALID_APPROVAL"] = 9] = "INVALID_APPROVAL";
    ErrorCodes[ErrorCodes["UNSUPPORTED_NETWORK"] = 10] = "UNSUPPORTED_NETWORK";
    ErrorCodes[ErrorCodes["RPC_API_KEY_NOT_SET"] = 11] = "RPC_API_KEY_NOT_SET";
    ErrorCodes[ErrorCodes["FAILED_TO_MERGE_STATE_TREE"] = 12] = "FAILED_TO_MERGE_STATE_TREE";
    ErrorCodes[ErrorCodes["FAILED_TO_MERGE_MESSAGE_SUBTREES"] = 13] = "FAILED_TO_MERGE_MESSAGE_SUBTREES";
    ErrorCodes[ErrorCodes["FAILED_TO_MERGE_MESSAGE_TREE"] = 14] = "FAILED_TO_MERGE_MESSAGE_TREE";
})(ErrorCodes || (ErrorCodes = {}));
