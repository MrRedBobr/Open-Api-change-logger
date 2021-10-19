"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeLogRenderer = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var handlebars_1 = __importDefault(require("handlebars"));
var ChangeLogRenderer = /** @class */ (function () {
    function ChangeLogRenderer(diffs, config) {
        this._changeLog = diffs;
        this._config = config;
        this.readConfig();
    }
    ChangeLogRenderer.prototype.readConfig = function () {
        if (this._config.hbsTemplate) {
            this._hbsTemplate = this._config.hbsTemplate;
        }
        else {
            this._hbsTemplate = fs_1.default.readFileSync(path_1.default.join(__dirname, '..', 'template', 'template.hbs'), 'utf8');
        }
    };
    ChangeLogRenderer.prototype.fixedName = function (field) {
        return field.replace('__added', '').replace('__deleted', '');
    };
    ChangeLogRenderer.prototype.changeTypeFromName = function (field) {
        return field.includes('__deleted') || field.includes('__added') ? (field.includes('__deleted') ? 'Deleted' : 'Added') : '';
    };
    ChangeLogRenderer.prototype.getSchemaObjectType = function (schema) {
        var _a, _b, _c, _d;
        var type = (_a = schema.type) !== null && _a !== void 0 ? _a : '';
        type = schema.type && schema.type === 'array' ? "[" + ((_b = schema.items['type']) !== null && _b !== void 0 ? _b : (_c = schema.items['$ref']) === null || _c === void 0 ? void 0 : _c.split('/').pop()) + "]" : type;
        type = schema.type && schema.type === 'string' && schema.enum ? "enum" : type;
        if (schema.allOf) {
            var refTypeName = (_d = schema.allOf[0].$ref.split('/').pop()) !== null && _d !== void 0 ? _d : '';
            type = refTypeName;
        }
        return type;
    };
    ChangeLogRenderer.prototype.renderSchemas = function () {
        var _this = this;
        var updatedSchemas = this._changeLog.schemasNames.filter(function (name) { return !(name.includes('__added') || name.includes('__deleted')); });
        var deletedSchemas = this._changeLog.schemasNames.filter(function (name) { return name.includes('__deleted'); });
        var addedSchemas = this._changeLog.schemasNames.filter(function (name) { return name.includes('__added'); });
        var updated = updatedSchemas.map(function (name) {
            var schema = _this._changeLog.destination.components.schemas[name];
            var diffSchema = _this._changeLog.apiObjectDiffs.components.schemas[name];
            var type = _this.getSchemaObjectType(schema);
            return _this.renderSchema('Update', type, name, name, schema, diffSchema);
        });
        var deleted = deletedSchemas.map(function (name) {
            var fixedName = _this.fixedName(name);
            var schema = _this._changeLog.source.components.schemas[fixedName];
            var diffSchema = _this._changeLog.apiObjectDiffs.components.schemas[fixedName];
            var type = _this.getSchemaObjectType(schema);
            return _this.renderSchema('Deleted', type, name, fixedName, schema, diffSchema);
        });
        var created = addedSchemas.map(function (name) {
            var fixedName = _this.fixedName(name);
            var schema = _this._changeLog.destination.components.schemas[fixedName];
            var diffSchema = _this._changeLog.apiObjectDiffs.components.schemas[fixedName];
            var type = _this.getSchemaObjectType(schema);
            return _this.renderSchema('Added', type, name, fixedName, schema, diffSchema);
        });
        return {
            updated: updated,
            created: created,
            deleted: deleted,
        };
    };
    ChangeLogRenderer.prototype.renderSchema = function (changeType, type, name, fixedName, schema, diffSchema) {
        var _a, _b;
        return __assign(__assign({ changeType: changeType, name: fixedName, type: type }, (type !== 'enum' && {
            properties: this.renderProperties(schema.properties, (_a = this._changeLog.apiObjectDiffs.components.schemas[name]) === null || _a === void 0 ? void 0 : _a.properties, (_b = this._changeLog.source.components.schemas[name]) === null || _b === void 0 ? void 0 : _b.properties),
        })), (type === 'enum' && __assign({}, (Array.isArray(diffSchema === null || diffSchema === void 0 ? void 0 : diffSchema.enum[0])
            ? {
                enum: diffSchema.enum.map(function (_a) {
                    var _b = __read(_a, 2), type = _b[0], value = _b[1];
                    var changeType = type === '+' || type === '-' ? (type === '-' ? 'Deleted' : 'Added') : '';
                    return {
                        changeType: changeType,
                        isAdded: type === '+',
                        isDelete: type === '-',
                        noChanges: type === ' ',
                        name: value,
                    };
                }),
            }
            : { enum: schema.enum.map(function (name) { return ({ name: name, noChanges: true }); }) }))));
    };
    ChangeLogRenderer.prototype.renderProperties = function (destinationSchemaProperties, diffProperties, sourceSchemaProperties) {
        var e_1, _a;
        var _this = this;
        if (destinationSchemaProperties && diffProperties) {
            var updatedKeys = Object.keys(diffProperties);
            var fixedUpdatedKeys = updatedKeys.map(function (key) { return _this.fixedName(key); });
            var keys = new Set(__spreadArray(__spreadArray([], __read(Object.keys(destinationSchemaProperties)), false), __read(fixedUpdatedKeys), false));
            var newProperties = {};
            var _loop_1 = function (key) {
                var index = updatedKeys.findIndex(function (name) { return name.includes(key); });
                var changeType = index !== -1 ? this_1.changeTypeFromName(updatedKeys[index]) : '';
                var noChanges = index === -1 || updatedKeys[index] === key;
                var type = changeType !== 'Deleted'
                    ? this_1.getSchemaObjectType(destinationSchemaProperties[key])
                    : this_1.getSchemaObjectType(sourceSchemaProperties[key]);
                newProperties[key] = {
                    changeType: changeType,
                    isDelete: changeType === 'Deleted',
                    isAdded: changeType === 'Added',
                    noChanges: noChanges,
                    type: type,
                };
            };
            var this_1 = this;
            try {
                for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                    var key = keys_1_1.value;
                    _loop_1(key);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return newProperties;
        }
        return {};
    };
    ChangeLogRenderer.prototype.pathChanges = function (_a) {
        var _b, _c, _d, _e;
        var name = _a.name, pathDiffs = _a.pathDiffs, parameterObjects = _a.parameterObjects, pathType = _a.pathType, requestBody = _a.requestBody, changeType = _a.changeType;
        return __assign(__assign(__assign({ name: name, isGet: pathType === 'get', isPatch: pathType === 'patch', isPost: pathType === 'post', isDelete: pathType === 'delete', pathType: pathType }, ((parameterObjects === null || parameterObjects === void 0 ? void 0 : parameterObjects.length) > 0 && {
            parameters: this.renderParameters(parameterObjects, pathDiffs)
        })), (requestBody && {
            body: (_e = (_d = (_c = (_b = requestBody.content['application/json'].schema) === null || _b === void 0 ? void 0 : _b.$ref) === null || _c === void 0 ? void 0 : _c.split('/')) === null || _d === void 0 ? void 0 : _d.pop()) !== null && _e !== void 0 ? _e : '',
        })), { changeType: changeType });
    };
    ChangeLogRenderer.prototype.getPathRenderer = function () {
        var _this = this;
        var updatedPaths = this._changeLog.paths.filter(function (name) { return !(name.includes('__added') || name.includes('__deleted')); });
        var deletePaths = this._changeLog.paths.filter(function (name) { return name.includes('__deleted'); });
        var createPaths = this._changeLog.paths.filter(function (name) { return name.includes('__added'); });
        // eslint-disable-next-line complexity
        var updated = updatedPaths.map(function (name) {
            var _a;
            var path = _this._changeLog.destination.paths[name];
            var pathsChanges = [];
            var getType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('get'); });
            if (path.get && getType) {
                var pathChange = _this.pathChanges({
                    name: name,
                    pathType: 'get',
                    parameterObjects: path.get.parameters,
                    pathDiffs: _this._changeLog.apiObjectDiffs.paths[name][getType].parameters,
                    changeType: _this.changeTypeFromName(getType)
                });
                pathsChanges.push(pathChange);
            }
            var postType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('post'); });
            if (path.post && postType) {
                var postChange = _this.pathChanges({
                    name: name,
                    pathType: 'post',
                    parameterObjects: path.post.parameters,
                    pathDiffs: _this._changeLog.apiObjectDiffs.paths[name][postType].parameters,
                    requestBody: path.post.requestBody,
                    changeType: _this.changeTypeFromName(postType)
                });
                pathsChanges.push(postChange);
            }
            var patchType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('patch'); });
            if (path.patch && patchType) {
                var patchChange = _this.pathChanges({
                    name: name,
                    pathType: 'patch',
                    parameterObjects: path.patch.parameters,
                    pathDiffs: _this._changeLog.apiObjectDiffs.paths[name][patchType].parameters,
                    requestBody: path.patch.requestBody,
                    changeType: _this.changeTypeFromName(patchType)
                });
                pathsChanges.push(patchChange);
            }
            var deleteType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('delete'); });
            if (path.delete && deleteType) {
                var pathChange = _this.pathChanges({
                    name: name,
                    pathType: 'delete',
                    parameterObjects: path.delete.parameters,
                    pathDiffs: _this._changeLog.apiObjectDiffs.paths[name][deleteType].parameters,
                    changeType: (_a = _this.changeTypeFromName(deleteType)) !== null && _a !== void 0 ? _a : 'Deleted',
                });
                pathsChanges.push(pathChange);
            }
            return pathsChanges;
        });
        var deleted = deletePaths.map(function (name) {
            var _a, _b, _c, _d;
            var fixedName = _this.fixedName(name);
            var path = _this._changeLog.source.paths[fixedName];
            var deletedPaths = [];
            var getType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('get'); });
            if (path.get && getType) {
                var pathChange = _this.pathChanges({
                    name: fixedName,
                    pathType: 'get',
                    parameterObjects: [],
                    pathDiffs: [],
                    changeType: (_a = _this.changeTypeFromName(getType)) !== null && _a !== void 0 ? _a : 'Deleted',
                });
                deletedPaths.push(pathChange);
            }
            var postType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('post'); });
            if (path.post && postType) {
                var pathChange = _this.pathChanges({
                    name: fixedName,
                    pathType: 'post',
                    parameterObjects: [],
                    pathDiffs: [],
                    changeType: (_b = _this.changeTypeFromName(postType)) !== null && _b !== void 0 ? _b : 'Deleted',
                });
                deletedPaths.push(pathChange);
            }
            var patchType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('patch'); });
            if (path.patch && patchType) {
                var pathChange = _this.pathChanges({
                    name: fixedName,
                    pathType: 'patch',
                    parameterObjects: [],
                    pathDiffs: [],
                    changeType: (_c = _this.changeTypeFromName(patchType)) !== null && _c !== void 0 ? _c : 'Deleted',
                });
                deletedPaths.push(pathChange);
            }
            var deleteType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('delete'); });
            if (path.delete && deleteType) {
                var pathChange = _this.pathChanges({
                    name: fixedName,
                    pathType: 'delete',
                    parameterObjects: [],
                    pathDiffs: [],
                    changeType: (_d = _this.changeTypeFromName(deleteType)) !== null && _d !== void 0 ? _d : 'Deleted',
                });
                deletedPaths.push(pathChange);
            }
            return deletedPaths;
        });
        // eslint-disable-next-line complexity
        var created = createPaths.map(function (name) {
            var _a;
            var fixedName = _this.fixedName(name);
            var path = _this._changeLog.destination.paths[fixedName];
            var createdPaths = [];
            var getType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('get'); });
            if (path.get && getType) {
                var pathChange = _this.pathChanges({
                    name: fixedName,
                    pathType: 'get',
                    parameterObjects: path.get.parameters,
                    pathDiffs: _this._changeLog.apiObjectDiffs.paths[name][getType].parameters,
                    changeType: _this.changeTypeFromName(getType)
                });
                createdPaths.push(pathChange);
            }
            var postType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('post'); });
            if (path.post && postType) {
                var postChange = _this.pathChanges({
                    name: fixedName,
                    pathType: 'post',
                    parameterObjects: path.post.parameters,
                    pathDiffs: _this._changeLog.apiObjectDiffs.paths[name][postType].parameters,
                    requestBody: path.post.requestBody,
                    changeType: _this.changeTypeFromName(postType)
                });
                createdPaths.push(postChange);
            }
            var patchType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('patch'); });
            if (path.patch && patchType) {
                var patchChange = _this.pathChanges({
                    name: fixedName,
                    pathType: 'patch',
                    parameterObjects: path.patch.parameters,
                    pathDiffs: _this._changeLog.apiObjectDiffs.paths[name][patchType].parameters,
                    requestBody: path.patch.requestBody,
                    changeType: _this.changeTypeFromName(patchType)
                });
                createdPaths.push(patchChange);
            }
            var deleteType = Object.keys(_this._changeLog.apiObjectDiffs.paths[name]).find(function (name) { return name.includes('delete'); });
            if (path.delete && deleteType) {
                var pathChange = _this.pathChanges({
                    name: fixedName,
                    pathType: 'delete',
                    parameterObjects: path.delete.parameters,
                    pathDiffs: _this._changeLog.apiObjectDiffs.paths[name][deleteType].parameters,
                    changeType: (_a = _this.changeTypeFromName(deleteType)) !== null && _a !== void 0 ? _a : 'Deleted',
                });
                createdPaths.push(pathChange);
            }
            return createdPaths;
        });
        return {
            updated: updated.flat(),
            created: created.flat(),
            deleted: deleted.flat(),
        };
    };
    ChangeLogRenderer.prototype.renderParameters = function (parameters, diffParameters) {
        var e_2, _a;
        var _b, _c, _d;
        var params = {};
        try {
            for (var _e = __values(parameters.entries()), _f = _e.next(); !_f.done; _f = _e.next()) {
                var _g = __read(_f.value, 2), index = _g[0], parameter = _g[1];
                var type = this.getSchemaObjectType(parameter.schema);
                if (Array.isArray(diffParameters[index]) && ((_b = diffParameters[index]) === null || _b === void 0 ? void 0 : _b.length) > 1) {
                    var changeType = '';
                    if (diffParameters[index][0] === '+' || diffParameters[index][0] === '-') {
                        changeType = diffParameters[index][0] === '+' ? 'Added' : 'Deleted';
                    }
                    params[parameter.name] = __assign(__assign({ changeType: changeType }, (((_c = diffParameters[index][1].schema) === null || _c === void 0 ? void 0 : _c.type) && { type: this.getSchemaObjectType(diffParameters[index][1].schema) })), (((_d = diffParameters[index][1].schema) === null || _d === void 0 ? void 0 : _d.enum) && {
                        enum: diffParameters[index][1].schema.enum.map(function (_a) {
                            var _b = __read(_a, 2), type = _b[0], value = _b[1];
                            var changeType = type === '+' || type === '-' ? (type === '-' ? 'Deleted' : 'Added') : '';
                            return {
                                changeType: changeType,
                                isAdded: type === '+',
                                isDelete: type === '-',
                                noChanges: type === ' ',
                                name: value,
                            };
                        }),
                    }));
                }
                else {
                    params[parameter.name] = {
                        changeType: '',
                        type: type,
                    };
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return params;
    };
    ChangeLogRenderer.prototype.renderHtmlString = function () {
        var _this = this;
        handlebars_1.default.registerHelper('includes', function (value, str, options) {
            if (value.includes(str)) {
                return options.fn(_this);
            }
            return options.inverse(_this);
        });
        var hbs = handlebars_1.default.compile(this._hbsTemplate);
        var _a = this._config, hbsTemplate = _a.hbsTemplate, apiName = _a.apiName, other = __rest(_a, ["hbsTemplate", "apiName"]);
        return hbs(__assign({ schemas: this.renderSchemas(), paths: this.getPathRenderer(), name: apiName, version: this._changeLog.version }, other));
    };
    return ChangeLogRenderer;
}());
exports.ChangeLogRenderer = ChangeLogRenderer;
//# sourceMappingURL=change-log-render.js.map