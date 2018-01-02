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
            this._scale = 400;
        }
        return CANVAS;
    }());
    LIVE2DDEFINE.CANVAS = CANVAS;
    LIVE2DDEFINE.MODELS_DEFINE = {};
    LIVE2DDEFINE.MODELS_NAME = [
        "haru", 'koharu', 'unitychan'
    ];
    function modelset(i, name) {
        LIVE2DDEFINE.MODELS_DEFINE[name] = new UNIT();
        LIVE2DDEFINE.MODELS_DEFINE[name].Model = new MODEL();
        LIVE2DDEFINE.MODELS_DEFINE[name].Canvas = new CANVAS();
        LIVE2DDEFINE.MODELS_DEFINE[name].Canvas._id = "glcanvas_" + name + "_" + i;
        LIVE2DDEFINE.MODELS_DEFINE[name].Model._commonpath = "../assets/common/";
        LIVE2DDEFINE.MODELS_DEFINE[name].Model._emptymotion = "empty.motion3.json";
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
var Live2DPixiModel_1 = require("./Live2DPixiModel");
document.addEventListener("DOMContentLoaded", function () {
    var model_id = [];
    var model_def = [];
    var model_info;
    var app;
    var Live2d_no = 0;
    var Live2d_canvas = [];
    init(Live2d_no);
    function init(i) {
        if (i === void 0) { i = 0; }
        model_id[i] = Define_1.LIVE2DDEFINE.MODELS_NAME[i];
        model_def[i] = Define_1.LIVE2DDEFINE.MODELS_DEFINE[model_id[i]];
        app = new PIXI.Application(model_def[i].Canvas._width, model_def[i].Canvas._height, { transparent: true });
        app.view.id = model_def[i].Canvas._id;
        PIXI.loader.add("ModelJson_" + model_def[i].Canvas._id, model_def[i].Model._filepath + model_def[i].Model._modeljson, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
        PIXI.loader.load(function (loader, resources) {
            model_info = resources["ModelJson_" + model_def[i].Canvas._id].data.FileReferences;
            Live2d_canvas[i] = new Live2DPixiModel_1.PIXI_LIVE2D.Live2DPixiModel(app, loader, model_info, model_id[i], model_def[i].Canvas, model_def[i].Model);
            document.body.appendChild(app.view);
        });
    }
    var animCnt = 0;
    document.getElementById("changeMotion").addEventListener("click", function () {
        animCnt++;
        if (animCnt >= model_info.Motions.length) {
            animCnt = 0;
        }
        changeLoop.innerHTML = "ループON";
        Live2d_canvas[Live2d_no].playAnimation(animCnt);
        document.getElementById("motionNm").innerText =
            ("" + model_info.Motions[animCnt]).replace("motions/", "").replace(".motion3.json", "");
    }, false);
    var changeLoop = document.getElementById("changeLoop");
    changeLoop.addEventListener("click", function () {
        if (changeLoop.innerHTML == "ループON") {
            changeLoop.innerHTML = "ループOFF";
        }
        else {
            changeLoop.innerHTML = "ループON";
        }
        Live2d_canvas[Live2d_no].setLoop(false);
    }, false);
    document.getElementById("deletebtn").addEventListener("click", function () {
        var ele = document.getElementById(model_def[Live2d_no].Canvas._id);
        document.body.removeChild(ele);
        Live2d_canvas[Live2d_no].destroy();
        Live2d_no--;
    });
    document.getElementById("changeChara").addEventListener("click", function () {
        Live2d_no++;
        init(Live2d_no);
    });
    var opacitySlider = document.getElementById("opacitySlider");
    opacitySlider.addEventListener("input", function () {
        Live2d_canvas[Live2d_no].changeOpacity(opacitySlider.value);
    });
    var positionXSlider = document.getElementById("positionXSlider");
    positionXSlider.addEventListener("input", function () {
        Live2d_canvas[Live2d_no].rePosition(positionXSlider.value, positionYSlider.value, scaleSlider.value);
    });
    var positionYSlider = document.getElementById("positionYSlider");
    positionYSlider.addEventListener("input", function () {
        Live2d_canvas[Live2d_no].rePosition(positionXSlider.value, positionYSlider.value, scaleSlider.value);
    });
    var scaleSlider = document.getElementById("scaleSlider");
    scaleSlider.addEventListener("input", function () {
        Live2d_canvas[Live2d_no].rePosition(positionXSlider.value, positionYSlider.value, scaleSlider.value);
    });
    var speedSlider = document.getElementById("speedSlider");
    speedSlider.addEventListener("input", function () {
        Live2d_canvas[Live2d_no].setTickSpeed(speedSlider.value);
    });
    var blendCnt = 1;
    var changeBlend = document.getElementById("changeBlend");
    changeBlend.addEventListener("click", function () {
        if (changeBlend.innerHTML == "ブレンドOVERRIDE") {
            changeBlend.innerHTML = "ブレンドADD";
        }
        else {
            changeBlend.innerHTML = "ブレンドOVERRIDE";
        }
        blendCnt++;
        Live2d_canvas[Live2d_no].changeBlend(blendCnt);
    }, false);
    var soundCnt = 0;
    document.getElementById("changeSound").addEventListener("click", function () {
        soundCnt++;
        if (soundCnt >= model_info.Sounds.length) {
            soundCnt = 0;
        }
        Live2d_canvas[Live2d_no].playSound(soundCnt);
        document.getElementById("soundNm").innerHTML =
            ("" + model_info.Sounds[soundCnt]).replace("sounds/", "").replace(".mp3", "");
    }, false);
    document.getElementById("stopSound").addEventListener("click", function () {
        Live2d_canvas[Live2d_no].stopSound(soundCnt);
    });
    document.getElementById("changeLipsync").addEventListener("click", function () {
        Live2d_canvas[Live2d_no].playLipsync();
    });
});

},{"./Define":1,"./Live2DPixiModel":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sound_1 = require("./Sound");
var PIXI_LIVE2D;
(function (PIXI_LIVE2D) {
    var Live2DPixiModel = (function () {
        function Live2DPixiModel(app, loader, model_info, model_id, canvas_def, model_def) {
            this._animations = [];
            this._emptyanims = [];
            this._sounds = [];
            this._mouse_x = 0;
            this._mouse_y = 0;
            this._pos_x = 0;
            this._pos_y = 0;
            this._dragging = false;
            this._app = app;
            this._loader = loader;
            this._model_info = model_info;
            this._model_id = model_id;
            this._canvas_def = canvas_def;
            this._model_def = model_def;
            this.init();
        }
        Live2DPixiModel.prototype.init = function () {
            var _this = this;
            this.loadMoc();
            this.loadTextures();
            this.loadMotions();
            this.loadPhysics();
            this.loadSounds();
            PIXI.loader.load(function (loader, resources) {
                _this.loadResources(resources);
                _this.loadAnimations(resources);
                _this.playAnimation(0);
                _this.rePosition();
                _this.onDragEvent();
                _this.resize();
                window.onresize = _this.resize;
                _this.tick();
            });
        };
        Live2DPixiModel.prototype.loadMoc = function () {
            PIXI.loader.add("Moc_" + this._canvas_def._id, this._model_def._filepath + this._model_info.Moc, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER });
        };
        Live2DPixiModel.prototype.loadTextures = function () {
            for (var i = 0; i < this._model_info.Textures.length; i++) {
                PIXI.loader.add("Texture" + i + "_" + this._canvas_def._id, this._model_def._filepath + this._model_info.Textures[i]);
            }
        };
        Live2DPixiModel.prototype.loadMotions = function () {
            PIXI.loader.add("Empty_" + this._canvas_def._id, this._model_def._commonpath + this._model_def._emptymotion, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
            if (this._model_info.Motions !== void 0) {
                for (var i = 0; i < this._model_info.Motions.length; i++) {
                    PIXI.loader.add("Motion" + i + "_" + this._canvas_def._id, this._model_def._filepath + this._model_info.Motions[i], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
                }
            }
        };
        Live2DPixiModel.prototype.loadPhysics = function () {
            if (this._model_info.Physics !== void 0) {
                PIXI.loader.add("Physics_" + this._canvas_def._id, this._model_def._filepath + this._model_info.Physics, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
            }
        };
        Live2DPixiModel.prototype.loadSounds = function () {
            if (this._model_info.Sounds !== void 0) {
                for (var i = 0; i < this._model_info.Sounds.length; i++) {
                    PIXI.loader.add("Sound" + i + "_" + this._canvas_def._id, this._model_def._filepath + this._model_info.Sounds[i], { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER });
                }
            }
        };
        Live2DPixiModel.prototype.loadResources = function (_resources) {
            this._moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(_resources["Moc_" + this._canvas_def._id].data);
            this._modelbuilder = new LIVE2DCUBISMPIXI.ModelBuilder();
            this._modelbuilder.setMoc(this._moc)
                .setTimeScale(1);
            for (var i = 0; i < this._model_info.Textures.length; i++) {
                this._modelbuilder.addTexture(i, _resources["Texture" + i + "_" + this._canvas_def._id].texture);
            }
            this._modelbuilder.addAnimatorLayer("Base_" + this._canvas_def._id, LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
            this._modelbuilder.addAnimatorLayer("Lipsync_" + this._canvas_def._id, LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
            this._modelbuilder.addAnimatorLayer("Drag_" + this._canvas_def._id, LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
            if (_resources["Physics_" + this._canvas_def._id] !== void 0) {
                this._modelbuilder.setPhysics3Json(_resources["Physics_" + this._canvas_def._id].data);
            }
            if (this._model_info.Sounds !== void 0) {
                for (var i = 0; i < this._model_info.Sounds.length; i++) {
                    this._sounds[i] = new Sound_1.LIVE2DSOUND.Sound(_resources["Sound" + i + "_" + this._canvas_def._id].data);
                }
            }
            this._model = this._modelbuilder.build();
            this._app.stage.addChild(this._model);
            this._app.stage.addChild(this._model.masks);
        };
        Live2DPixiModel.prototype.loadAnimations = function (_resources) {
            for (var k = 0; k < 2; k++) {
                this._emptyanims[k] =
                    LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(_resources["Empty_" + this._canvas_def._id].data);
            }
            if (this._model_info.Motions !== void 0) {
                for (var i = 0; i < this._model_info.Motions.length; i++) {
                    this._animations[i] =
                        LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(_resources["Motion" + i + "_" + this._canvas_def._id].data);
                }
            }
        };
        Live2DPixiModel.prototype.onDragEvent = function () {
            this._param_angle_x = this._model.parameters.ids.indexOf("PARAM_ANGLE_X");
            this._param_angle_y = this._model.parameters.ids.indexOf("PARAM_ANGLE_Y");
            this._param_body_angle_x = this._model.parameters.ids.indexOf("PARAM_BODY_ANGLE_X");
            this._param_eye_ball_x = this._model.parameters.ids.indexOf("PARAM_EYE_BALL_X");
            this._param_eye_ball_y = this._model.parameters.ids.indexOf("PARAM_EYE_BALL_Y");
            this._app.view.addEventListener('pointerdown', this._onDragStart.bind(this), false);
            this._app.view.addEventListener('pointerup', this._onDragEnd.bind(this), false);
            this._app.view.addEventListener('pointerout', this._onDragEnd.bind(this), false);
            this._app.view.addEventListener('pointermove', this._onDragMove.bind(this), false);
        };
        Live2DPixiModel.prototype._onDragStart = function (event) {
            this._dragging = true;
        };
        Live2DPixiModel.prototype._onDragEnd = function (event) {
            this._dragging = false;
            this._pos_x = 0.0;
            this._pos_y = 0.0;
        };
        Live2DPixiModel.prototype._onDragMove = function (event) {
            this._mouse_x = this._model.position.x - event.offsetX;
            this._mouse_y = this._model.position.y - event.offsetY;
            var height = this._app.screen.height / 2;
            var width = this._app.screen.width / 2;
            var scale = 1.0 - (height / this._canvas_def._scale);
            this._pos_x = -this._mouse_x / height;
            this._pos_y = -(this._mouse_y / width) + scale;
        };
        Live2DPixiModel.prototype.playAnimation = function (i) {
            this._model.animator.getLayer("Base_" + this._canvas_def._id).play(this._animations[i]);
        };
        Live2DPixiModel.prototype.playLipsync = function () {
            var _this = this;
            this._emptyanims[0].evaluate = function (time, weight, blend, target) {
                _this._param_mouth_open_y = target.parameters.ids.indexOf("PARAM_MOUTH_OPEN_Y");
                if (_this._param_mouth_open_y >= 0) {
                    var sample = (Math.sin(time * 9.543) + 1 + Math.sin(time * 13.831)) / 2;
                    target.parameters.values[_this._param_mouth_open_y] =
                        blend(target.parameters.values[_this._param_mouth_open_y], sample, weight);
                }
            };
            this._model.animator.getLayer("Lipsync_" + this._canvas_def._id).play(this._emptyanims[0]);
        };
        Live2DPixiModel.prototype.stopAnimation = function () {
            this._model.animator.getLayer("Base_" + this._canvas_def._id).stop();
        };
        Live2DPixiModel.prototype.setLoop = function (loop) {
            this._model.animator.getLayer("Base_" + this._canvas_def._id).currentAnimation.loop = loop;
        };
        Live2DPixiModel.prototype.playSound = function (i) {
            this._sounds[i].play();
        };
        Live2DPixiModel.prototype.stopSound = function (i) {
            this._sounds[i].stop();
        };
        Live2DPixiModel.prototype.tick = function () {
            var _this = this;
            this._app.ticker.add(function (deltaTime) {
                _this.resize();
                _this.rePosition();
                _this._updateParameter();
                _this._model.update(deltaTime);
                _this._model.masks.update(_this._app.renderer);
            });
        };
        Live2DPixiModel.prototype._updateParameter = function () {
            var _this = this;
            this._emptyanims[1].evaluate = function (time, weight, blend, target) {
                if (_this._param_angle_x >= 0) {
                    target.parameters.values[_this._param_angle_x] =
                        blend(target.parameters.values[_this._param_angle_x], _this._pos_x * 30, weight);
                }
                if (_this._param_angle_y >= 0) {
                    target.parameters.values[_this._param_angle_y] =
                        blend(target.parameters.values[_this._param_angle_y], -_this._pos_y * 30, weight);
                }
                if (_this._param_body_angle_x >= 0) {
                    target.parameters.values[_this._param_body_angle_x] =
                        blend(target.parameters.values[_this._param_body_angle_x], _this._pos_x * 10, weight);
                }
                if (_this._param_eye_ball_x >= 0) {
                    target.parameters.values[_this._param_eye_ball_x] =
                        blend(target.parameters.values[_this._param_eye_ball_x], _this._pos_x, weight);
                }
                if (_this._param_eye_ball_y >= 0) {
                    target.parameters.values[_this._param_eye_ball_y] =
                        blend(target.parameters.values[_this._param_eye_ball_y], -_this._pos_y, weight);
                }
            };
            this._model.animator.getLayer("Drag_" + this._canvas_def._id).play(this._emptyanims[1]);
        };
        Live2DPixiModel.prototype.changeBlend = function (i) {
            if (i % 2 == 0) {
                this._model.animator.getLayer("Base_" + this._canvas_def._id).blend =
                    LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD;
            }
            else {
                this._model.animator.getLayer("Base_" + this._canvas_def._id).blend =
                    LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
            }
        };
        Live2DPixiModel.prototype.changeOpacity = function (opacity) {
            this._app.view.style.opacity = opacity;
        };
        Live2DPixiModel.prototype.setTickSpeed = function (speed) {
            if (speed === void 0) { speed = 1; }
            this._app.ticker.speed = speed;
        };
        Live2DPixiModel.prototype.showTickFPS = function () {
            console.log(this._app.ticker.FPS);
        };
        Live2DPixiModel.prototype.rePosition = function (positionX, positionY, scale) {
            if (positionX === void 0) { positionX = this._canvas_def._x; }
            if (positionY === void 0) { positionY = this._canvas_def._y; }
            if (scale === void 0) { scale = this._canvas_def._scale; }
            this._canvas_def._x = positionX;
            this._canvas_def._y = positionY;
            this._canvas_def._scale = scale;
            this._model.position = new PIXI.Point(positionX, positionY);
            this._model.scale = new PIXI.Point(scale, scale);
        };
        Live2DPixiModel.prototype.resize = function () {
            var width = this._canvas_def._width;
            var height = this._canvas_def._height;
            this._app.view.style.width = width + "px";
            this._app.view.style.height = height + "px";
            this._app.renderer.resize(width, height);
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

},{"./Sound":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LIVE2DSOUND;
(function (LIVE2DSOUND) {
    var Sound = (function () {
        function Sound(snd) {
            this._snd = snd;
        }
        Sound.prototype.play = function () {
            this._snd.play();
        };
        Sound.prototype.stop = function () {
            this._snd.pause();
            this._snd.currentTime = 0;
        };
        Sound.prototype.volume = function () {
            return this._snd.volume;
        };
        return Sound;
    }());
    LIVE2DSOUND.Sound = Sound;
})(LIVE2DSOUND = exports.LIVE2DSOUND || (exports.LIVE2DSOUND = {}));

},{}]},{},[1,2,3]);
