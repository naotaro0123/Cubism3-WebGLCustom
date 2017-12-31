"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Define_1 = require("./Define");
var Live2DModel_1 = require("./Live2DModel");
document.addEventListener("DOMContentLoaded", function () {
    var modelId = Define_1.LIVE2DDEFINE.MODELS_NAME[2];
    var modelDef = Define_1.LIVE2DDEFINE.MODELS_DEFINE[modelId];
    var modelInfo;
    var app;
    var Live2Dcanvas;
    init();
    function init(i) {
        if (i === void 0) { i = 0; }
        modelId = Define_1.LIVE2DDEFINE.MODELS_NAME[i];
        modelDef = Define_1.LIVE2DDEFINE.MODELS_DEFINE[modelId];
        app = new PIXI.Application(modelDef.Canvas._width, modelDef.Canvas._height, { backgroundColor: modelDef.Canvas._bgcolor });
        app.view.id = modelDef.Canvas._id + "_" + modelId;
        PIXI.loader.add("ModelJson_" + modelId, modelDef.Model._filepath + modelDef.Model._modeljson, { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
        PIXI.loader.load(function (loader, resources) {
            modelInfo = resources["ModelJson_" + modelId].data.FileReferences;
            Live2Dcanvas = new Live2DModel_1.PIXI_LIVE2D.Live2DPixiModel(app, loader, modelInfo, modelId, modelDef.Canvas, modelDef.Model);
            document.body.appendChild(app.view);
        });
    }
    var cnt = 0;
    var modelCng = 0;
    document.getElementById("changeMotion").addEventListener("click", function () {
        cnt++;
        if (cnt >= modelInfo.Motions.length) {
            cnt = 0;
        }
        Live2Dcanvas.playAnimation(cnt);
        document.getElementById("motionNm").innerText = "motion" + cnt + " playing";
    }, false);
    document.getElementById("changeLoop").addEventListener("click", function () {
        Live2Dcanvas.setLoop(false);
    }, false);
    document.getElementById("deletebtn").addEventListener("click", function () {
        document.body.removeChild(app.view);
        Live2Dcanvas.destroy();
    });
    document.getElementById("changeChara").addEventListener("click", function () {
        modelCng++;
        if (modelCng > 2) {
            modelCng = 0;
        }
        init(modelCng);
    });
});
