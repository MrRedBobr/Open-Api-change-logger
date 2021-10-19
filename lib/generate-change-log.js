"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateChangeLog = void 0;
var change_log_diffs_1 = require("./change-log-diffs");
var change_log_render_1 = require("./change-log-render");
var GenerateChangeLog = /** @class */ (function () {
    function GenerateChangeLog(source, destination, config) {
        this._source = source;
        this._destination = destination;
        var diff = new change_log_diffs_1.ChangeLogDiffs(source, destination);
        this.renderer = new change_log_render_1.ChangeLogRenderer(diff, config);
    }
    GenerateChangeLog.prototype.render = function () {
        return this.renderer.renderHtmlString();
    };
    return GenerateChangeLog;
}());
exports.GenerateChangeLog = GenerateChangeLog;
//# sourceMappingURL=generate-change-log.js.map