/**
 * WS events for subgraph
 */
export var ESubgraphEvents;
(function (ESubgraphEvents) {
    ESubgraphEvents["START"] = "start-deploy";
    ESubgraphEvents["PROGRESS"] = "progress-deploy";
    ESubgraphEvents["FINISH"] = "finish-deploy";
    ESubgraphEvents["ERROR"] = "exception";
})(ESubgraphEvents || (ESubgraphEvents = {}));
/**
 * Progress step
 */
export var EProgressStep;
(function (EProgressStep) {
    EProgressStep[EProgressStep["SCHEMA"] = 0] = "SCHEMA";
    EProgressStep[EProgressStep["NETWORK"] = 1] = "NETWORK";
    EProgressStep[EProgressStep["TEMPLATE"] = 2] = "TEMPLATE";
    EProgressStep[EProgressStep["CODEGEN"] = 3] = "CODEGEN";
    EProgressStep[EProgressStep["BUILD"] = 4] = "BUILD";
    EProgressStep[EProgressStep["DEPLOY"] = 5] = "DEPLOY";
})(EProgressStep || (EProgressStep = {}));
export const TOTAL_STEPS = Object.keys(EProgressStep).length / 2;
