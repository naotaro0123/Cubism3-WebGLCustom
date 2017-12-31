(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LIVE2DDEFINE;
(function (LIVE2DDEFINE) {
    var UNIT = (function () {
        function UNIT() {
        }
        return UNIT;
    }());
    LIVE2DDEFINE.UNIT = UNIT;
    var MODEL = (function () {
        function MODEL() {
        }
        return MODEL;
    }());
    LIVE2DDEFINE.MODEL = MODEL;
    var CANVAS = (function () {
        function CANVAS() {
            this._id = "glcanvas";
            this._width = 400;
            this._height = 400;
            this._x = 200;
            this._y = 300;
            this._scaleX = 400;
            this._scaleY = 400;
            this._bgcolor = 0x1099bb;
        }
        return CANVAS;
    }());
    LIVE2DDEFINE.CANVAS = CANVAS;
    LIVE2DDEFINE.MODELS_DEFINE = {};
    LIVE2DDEFINE.MODELS_NAME = [
        "haru", 'koharu', 'unitychan',
        "haru", 'koharu', 'unitychan'
    ];
    function modelset(i, name) {
        LIVE2DDEFINE.MODELS_DEFINE[name] = new UNIT();
        LIVE2DDEFINE.MODELS_DEFINE[name].Model = new MODEL();
        LIVE2DDEFINE.MODELS_DEFINE[name].Canvas = new CANVAS();
        LIVE2DDEFINE.MODELS_DEFINE[name].Canvas._id = "glcanvas_" + name + "_" + i;
        LIVE2DDEFINE.MODELS_DEFINE[name].Model._filepath = "../assets/" + name + "/";
        LIVE2DDEFINE.MODELS_DEFINE[name].Model._modeljson = name + ".model3.json";
    }
    var index = 0;
    var id = LIVE2DDEFINE.MODELS_NAME[index];
    modelset(index, id);
    index++;
    id = LIVE2DDEFINE.MODELS_NAME[index];
    modelset(index, id);
    index++;
    id = LIVE2DDEFINE.MODELS_NAME[index];
    modelset(index, id);
})(LIVE2DDEFINE = exports.LIVE2DDEFINE || (exports.LIVE2DDEFINE = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Define_1 = require("./Define");
var Live2DModel_1 = require("./Live2DModel");
document.addEventListener("DOMContentLoaded", function () {
    var modelId = [];
    var modelDef = [];
    var modelInfo;
    var app;
    var Live2Dglno = 0;
    var Live2Dcanvas = [];
    init(Live2Dglno);
    function init(i) {
        if (i === void 0) { i = 0; }
        modelId[i] = Define_1.LIVE2DDEFINE.MODELS_NAME[i];
        modelDef[i] = Define_1.LIVE2DDEFINE.MODELS_DEFINE[modelId[i]];
        app = new PIXI.Application(modelDef[i].Canvas._width, modelDef[i].Canvas._height, { backgroundColor: modelDef[i].Canvas._bgcolor });
        app.view.id = modelDef[i].Canvas._id;
        PIXI.loader.add("ModelJson_" + modelDef[i].Canvas._id, modelDef[i].Model._filepath + modelDef[i].Model._modeljson, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
        PIXI.loader.load(function (loader, resources) {
            modelInfo = resources["ModelJson_" + modelDef[i].Canvas._id].data.FileReferences;
            Live2Dcanvas[i] = new Live2DModel_1.PIXI_LIVE2D.Live2DPixiModel(app, loader, modelInfo, modelId[i], modelDef[i].Canvas, modelDef[i].Model);
            document.body.appendChild(app.view);
        });
    }
    var cnt = 0;
    document.getElementById("changeMotion").addEventListener("click", function () {
        cnt++;
        if (cnt >= modelInfo.Motions.length) {
            cnt = 0;
        }
        Live2Dcanvas[Live2Dglno].playAnimation(cnt);
        document.getElementById("motionNm").innerText = "motion" + cnt + " playing";
    }, false);
    document.getElementById("changeLoop").addEventListener("click", function () {
        Live2Dcanvas[Live2Dglno].setLoop(false);
    }, false);
    document.getElementById("deletebtn").addEventListener("click", function () {
        var ele = document.getElementById(modelDef[Live2Dglno].Canvas._id);
        document.body.removeChild(ele);
        Live2Dcanvas[Live2Dglno].destroy();
        Live2Dglno--;
    });
    document.getElementById("changeChara").addEventListener("click", function () {
        Live2Dglno++;
        init(Live2Dglno);
    });
    document.getElementById("changeColor").addEventListener("click", function () {
    });
});

},{"./Define":1,"./Live2DModel":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PIXI_LIVE2D;
(function (PIXI_LIVE2D) {
    var Live2DPixiModel = (function () {
        function Live2DPixiModel(app, loader, modelInfo, modelId, canvasDefine, modelDefine) {
            this._app = app;
            this._loader = loader;
            this._modelInfo = modelInfo;
            this._modelId = modelId;
            this._canvasDefine = canvasDefine;
            this._modelDefine = modelDefine;
            this.init();
        }
        Live2DPixiModel.prototype.init = function () {
            var _this = this;
            this.loadMoc();
            this.loadTextures();
            this.loadMotions();
            this.loadPhysics();
            PIXI.loader.load(function (loader, resources) {
                _this.loadResources(resources);
                _this.loadAnimations(resources);
                _this.playAnimation(0);
                _this.resize();
                window.onresize = _this.resize;
                _this.tick();
            });
        };
        Live2DPixiModel.prototype.loadMoc = function () {
            PIXI.loader.add("Moc_" + this._canvasDefine._id, this._modelDefine._filepath + this._modelInfo.Moc, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER });
        };
        Live2DPixiModel.prototype.loadTextures = function () {
            for (var i = 0; i < this._modelInfo.Textures.length; i++) {
                PIXI.loader.add("Texture" + i + "_" + this._canvasDefine._id, this._modelDefine._filepath + this._modelInfo.Textures[i]);
            }
        };
        Live2DPixiModel.prototype.loadMotions = function () {
            if (this._modelInfo.Motions !== void 0) {
                for (var i = 0; i < this._modelInfo.Motions.length; i++) {
                    PIXI.loader.add("Motion" + i + "_" + this._canvasDefine._id, this._modelDefine._filepath + this._modelInfo.Motions[i], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
                }
            }
        };
        Live2DPixiModel.prototype.loadPhysics = function () {
            if (this._modelInfo.Physics !== void 0) {
                PIXI.loader.add("Physics_" + this._canvasDefine._id, this._modelDefine._filepath + this._modelInfo.Physics, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
            }
        };
        Live2DPixiModel.prototype.loadResources = function (_resources) {
            this._moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(_resources["Moc_" + this._canvasDefine._id].data);
            this._modelbuilder = new LIVE2DCUBISMPIXI.ModelBuilder();
            this._modelbuilder.setMoc(this._moc)
                .setTimeScale(1);
            for (var i = 0; i < this._modelInfo.Textures.length; i++) {
                this._modelbuilder.addTexture(i, _resources["Texture" + i + "_" + this._canvasDefine._id].texture);
            }
            this._modelbuilder.addAnimatorLayer("Base_" + this._canvasDefine._id, LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
            if (_resources["Physics_" + this._canvasDefine._id] !== void 0) {
                this._modelbuilder.setPhysics3Json(_resources["Physics_" + this._canvasDefine._id].data);
            }
            this._model = this._modelbuilder.build();
            this._app.stage.addChild(this._model);
            this._app.stage.addChild(this._model.masks);
        };
        Live2DPixiModel.prototype.loadAnimations = function (_resources) {
            this._animations = [];
            if (this._modelInfo.Motions !== void 0) {
                for (var i = 0; i < this._modelInfo.Motions.length; i++) {
                    this._animations[i] =
                        LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(_resources["Motion" + i + "_" + this._canvasDefine._id].data);
                }
            }
        };
        Live2DPixiModel.prototype.playAnimation = function (i) {
            this._model.animator.getLayer("Base_" + this._canvasDefine._id).play(this._animations[i]);
        };
        Live2DPixiModel.prototype.stopAnimation = function () {
            this._model.animator.getLayer("Base_" + this._canvasDefine._id).stop();
        };
        Live2DPixiModel.prototype.setLoop = function (loop) {
            this._model.animator.getLayer("Base_" + this._canvasDefine._id).currentAnimation.loop = loop;
        };
        Live2DPixiModel.prototype.tick = function () {
            var _this = this;
            this._app.ticker.add(function (deltaTime) {
                _this._model.update(deltaTime);
                _this._model.masks.update(_this._app.renderer);
            });
        };
        Live2DPixiModel.prototype.changeColor = function (r, g, b) {
        };
        Live2DPixiModel.prototype.setTickSpeed = function (speed) {
            if (speed === void 0) { speed = 1; }
            this._app.ticker.speed = speed;
        };
        Live2DPixiModel.prototype.showTickFPS = function () {
            console.log(this._app.ticker.FPS);
        };
        Live2DPixiModel.prototype.resize = function () {
            var width = this._canvasDefine._width;
            var height = this._canvasDefine._height;
            this._app.view.style.width = width + "px";
            this._app.view.style.height = height + "px";
            this._app.renderer.resize(width, height);
            this._model.position = new PIXI.Point(this._canvasDefine._x, this._canvasDefine._y);
            this._model.scale = new PIXI.Point(this._canvasDefine._scaleX, this._canvasDefine._scaleY);
            this._model.masks.resize(this._app.view.width, this._app.view.height);
        };
        Live2DPixiModel.prototype.destroy = function () {
            this.stopAnimation();
            this._app.ticker.stop();
            this._loader.reset();
            this._app.destroy();
        };
        return Live2DPixiModel;
    }());
    PIXI_LIVE2D.Live2DPixiModel = Live2DPixiModel;
})(PIXI_LIVE2D = exports.PIXI_LIVE2D || (exports.PIXI_LIVE2D = {}));

},{}]},{},[1,2,3]);
