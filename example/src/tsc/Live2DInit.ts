import { LIVE2DDEFINE } from './Define';
import { PIXI_LIVE2D } from './Live2DModel';


document.addEventListener("DOMContentLoaded", () => {
    let modelId = LIVE2DDEFINE.MODELS_NAME[2];
    let modelDef = LIVE2DDEFINE.MODELS_DEFINE[modelId];
    let modelInfo: any;
    let app: PIXI.Application;
    // let Live2Dglno: number = 0;
    let Live2Dcanvas: any;

    init();

    function init(i: number = 0){
        modelId = LIVE2DDEFINE.MODELS_NAME[i];
        modelDef = LIVE2DDEFINE.MODELS_DEFINE[modelId];
            // Create app.
        app = new PIXI.Application(modelDef.Canvas._width,
            modelDef.Canvas._height, {backgroundColor : modelDef.Canvas._bgcolor});
        app.view.id = modelDef.Canvas._id + "_" + modelId;

        PIXI.loader.add(`ModelJson_${modelId}`, modelDef.Model._filepath + modelDef.Model._modeljson,
            { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
        PIXI.loader.load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
            modelInfo = resources[`ModelJson_${modelId}`].data.FileReferences;

            Live2Dcanvas = new PIXI_LIVE2D.Live2DPixiModel(
                app, loader, modelInfo, modelId, modelDef.Canvas, modelDef.Model);

            // Live2Dglno++;
            document.body.appendChild(app.view);
        });
    }

    // Animation Change
    let cnt : number = 0;
    let modelCng: number = 0;

    document.getElementById("changeMotion").addEventListener("click", () => {
        cnt++;
        if(cnt >= modelInfo.Motions.length){
            cnt = 0;
        }
        Live2Dcanvas.playAnimation(cnt);
        document.getElementById("motionNm").innerText = `motion${cnt} playing`;
    }, false);

    // Loop On/Off
    document.getElementById("changeLoop").addEventListener("click", () => {
        Live2Dcanvas.setLoop(false);
    }, false);

    document.getElementById("deletebtn").addEventListener("click", () => {
        document.body.removeChild(app.view);
        Live2Dcanvas.destroy();
    });

    document.getElementById("changeChara").addEventListener("click", () => {
        modelCng++;
        if(modelCng > 2){
            modelCng = 0;
        }
        init(modelCng);
    });
});
