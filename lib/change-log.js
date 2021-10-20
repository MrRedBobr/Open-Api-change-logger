"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeLog = void 0;
var open_api_diff_1 = require("./open-api-diff");
var converter_1 = require("./converter");
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var handlebars_1 = __importDefault(require("handlebars"));
var ChangeLog = /** @class */ (function () {
    function ChangeLog(source, destination, config) {
        this._source = source;
        this._destination = destination;
        var diff = new open_api_diff_1.OpenApiDiff(source, destination);
        this._openApiDiff = diff;
        this._converter = new converter_1.Converter(diff, config);
        this.readConfig(config);
    }
    ChangeLog.prototype.readConfig = function (config) {
        if (config.hbsTemplate) {
            this._hbsTemplate = config.hbsTemplate;
        }
        else {
            this._hbsTemplate = fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'template', 'template.hbs'), 'utf8');
        }
    };
    ChangeLog.prototype.render = function () {
        var _this = this;
        handlebars_1.default.registerHelper('includes', function (value, str, options) {
            if (value.includes(str)) {
                return options.fn(_this);
            }
            return options.inverse(_this);
        });
        var hbs = handlebars_1.default.compile(this._hbsTemplate);
        return hbs(this._converter.changes());
    };
    return ChangeLog;
}());
exports.ChangeLog = ChangeLog;
//# sourceMappingURL=change-log.js.map