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
            PIXI.loader.add("Moc_" + this._app.view.id, this._modelDefine._filepath + this._modelInfo.Moc, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER });
        };
        Live2DPixiModel.prototype.loadTextures = function () {
            for (var i = 0; i < this._modelInfo.Textures.length; i++) {
                PIXI.loader.add("Texture" + i + "_" + this._app.view.id, this._modelDefine._filepath + this._modelInfo.Textures[i]);
            }
        };
        Live2DPixiModel.prototype.loadMotions = function () {
            if (this._modelInfo.Motions !== void 0) {
                for (var i = 0; i < this._modelInfo.Motions.length; i++) {
                    PIXI.loader.add("Motion" + i + "_" + this._app.view.id, this._modelDefine._filepath + this._modelInfo.Motions[i], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
                }
            }
        };
        Live2DPixiModel.prototype.loadPhysics = function () {
            if (this._modelInfo.Physics !== void 0) {
                PIXI.loader.add("Physics_" + this._app.view.id, this._modelDefine._filepath + this._modelInfo.Physics, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
            }
        };
        Live2DPixiModel.prototype.loadResources = function (_resources) {
            this._moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(_resources["Moc_" + this._app.view.id].data);
            this._modelbuilder = new LIVE2DCUBISMPIXI.ModelBuilder();
            this._modelbuilder.setMoc(this._moc)
                .setTimeScale(1);
            for (var i = 0; i < this._modelInfo.Textures.length; i++) {
                this._modelbuilder.addTexture(i, _resources["Texture" + i + "_" + this._app.view.id].texture);
            }
            this._modelbuilder.addAnimatorLayer("Base_" + this._app.view.id, LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
            if (_resources["Physics_" + this._app.view.id] !== void 0) {
                this._modelbuilder.setPhysics3Json(_resources["Physics_" + this._app.view.id].data);
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
                        LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(_resources["Motion" + i + "_" + this._app.view.id].data);
                }
            }
        };
        Live2DPixiModel.prototype.playAnimation = function (i) {
            this._model.animator.getLayer("Base_" + this._app.view.id).play(this._animations[i]);
        };
        Live2DPixiModel.prototype.stopAnimation = function () {
            this._model.animator.getLayer("Base_" + this._app.view.id).stop();
        };
        Live2DPixiModel.prototype.setLoop = function (loop) {
            this._model.animator.getLayer("Base_" + this._app.view.id).currentAnimation.loop = loop;
        };
        Live2DPixiModel.prototype.tick = function () {
            var _this = this;
            this._app.ticker.add(function (deltaTime) {
                _this._model.update(deltaTime);
                _this._model.masks.update(_this._app.renderer);
            });
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
