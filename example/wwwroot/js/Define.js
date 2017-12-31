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
        "haru", 'koharu', 'unitychan'
    ];
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[0]] = new UNIT();
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[0]].Model = new MODEL();
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[0]].Canvas = new CANVAS();
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[0]].Model._filepath = "../assets/haru/";
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[0]].Model._modeljson = "haru.model3.json";
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[1]] = new UNIT();
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[1]].Model = new MODEL();
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[1]].Canvas = new CANVAS();
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[1]].Model._filepath = "../assets/koharu/";
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[1]].Model._modeljson = "koharu.model3.json";
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[2]] = new UNIT();
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[2]].Model = new MODEL();
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[2]].Canvas = new CANVAS();
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[2]].Model._filepath = "../assets/unitychan/";
    LIVE2DDEFINE.MODELS_DEFINE[LIVE2DDEFINE.MODELS_NAME[2]].Model._modeljson = "unitychan.model3.json";
})(LIVE2DDEFINE = exports.LIVE2DDEFINE || (exports.LIVE2DDEFINE = {}));
