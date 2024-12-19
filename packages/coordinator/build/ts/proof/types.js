/**
 * WS events for proof generation
 */
export var EProofGenerationEvents;
(function (EProofGenerationEvents) {
    EProofGenerationEvents["START"] = "start-generation";
    EProofGenerationEvents["PROGRESS"] = "progress-generation";
    EProofGenerationEvents["FINISH"] = "finish-generation";
    EProofGenerationEvents["ERROR"] = "exception";
})(EProofGenerationEvents || (EProofGenerationEvents = {}));
