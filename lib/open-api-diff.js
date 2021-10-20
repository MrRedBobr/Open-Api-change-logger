"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApiDiff = void 0;
var json_diff_1 = __importDefault(require("json-diff"));
var OpenApiDiff = /** @class */ (function () {
    function OpenApiDiff(source, destination) {
        this._schemasNames = [];
        this._hasSchemasChanges = false;
        this._paths = [];
        this._hasPathsChanges = false;
        this._version = '';
        this._source = source;
        this._destination = destination;
        this._version = source.info.version;
        this.apiDifference();
        this.pathsAndSchemasName();
        this.changes();
        this.apiVersionByChanges();
    }
    Object.defineProperty(OpenApiDiff.prototype, "apiObjectDiffs", {
        get: function () {
            return this._apiObjectDiffs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OpenApiDiff.prototype, "source", {
        get: function () {
            return this._source;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OpenApiDiff.prototype, "destination", {
        get: function () {
            return this._destination;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OpenApiDiff.prototype, "schemasNames", {
        get: function () {
            return this._schemasNames;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OpenApiDiff.prototype, "paths", {
        get: function () {
            return this._paths;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OpenApiDiff.prototype, "version", {
        get: function () {
            return this._version;
        },
        enumerable: false,
        configurable: true
    });
    OpenApiDiff.prototype.apiDifference = function () {
        this._apiObjectDiffs = json_diff_1.default.diff(this._source, this._destination);
    };
    OpenApiDiff.prototype.pathsAndSchemasName = function () {
        var _a, _b;
        var _c, _d;
        if ((_d = (_c = this._apiObjectDiffs) === null || _c === void 0 ? void 0 : _c.components) === null || _d === void 0 ? void 0 : _d.schemas) {
            (_a = this._schemasNames).push.apply(_a, __spreadArray([], __read(Object.keys(this._apiObjectDiffs.components.schemas)), false));
            this._hasSchemasChanges = true;
        }
        if (this._apiObjectDiffs.paths) {
            (_b = this._paths).push.apply(_b, __spreadArray([], __read(Object.keys(this._apiObjectDiffs.paths)), false));
            this._hasPathsChanges = true;
        }
    };
    OpenApiDiff.prototype.changes = function () {
        this._schemasChangesGroups = {
            updated: this._schemasNames.filter(function (name) { return !(name.includes('__added') || name.includes('__deleted')); }),
            deleted: this._schemasNames.filter(function (name) { return name.includes('__deleted'); }),
            added: this._schemasNames.filter(function (name) { return name.includes('__added'); }),
        };
        this._pathsChangesGroups = {
            updated: this._paths.filter(function (name) { return !(name.includes('__added') || name.includes('__deleted')); }),
            deleted: this._paths.filter(function (name) { return name.includes('__deleted'); }),
            added: this._paths.filter(function (name) { return name.includes('__added'); }),
        };
    };
    OpenApiDiff.prototype.apiVersionByChanges = function () {
        if (this.hasChanges()) {
            var _a = __read(this._version.split('.'), 3), major = _a[0], minor = _a[1], patch = _a[2];
            if (this._pathsChangesGroups.deleted.length > 0) {
                this._version = Number(major) + 1 + ".0.0";
            }
            else {
                if (this._pathsChangesGroups.added && this._pathsChangesGroups.updated) {
                    this._version = major + "." + (Number(minor) + 1) + "." + patch;
                }
                else {
                    this._version = major + "." + minor + "." + (Number(patch) + 1);
                }
            }
        }
    };
    OpenApiDiff.prototype.hasChanges = function () {
        return this._hasPathsChanges || this._hasSchemasChanges;
    };
    return OpenApiDiff;
}());
exports.OpenApiDiff = OpenApiDiff;
//# sourceMappingURL=open-api-diff.js.map