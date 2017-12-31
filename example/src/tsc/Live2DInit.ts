import { LIVE2DDEFINE } from './Define';
import { PIXI_LIVE2D } from './Live2DModel';


document.addEventListener("DOMContentLoaded", () => {
    let modelId: any = [];
    let modelDef: any = [];
    let modelInfo: any;
    let app: PIXI.Application;
    let Live2Dglno: number = 0;
    let Live2Dcanvas: any = [];

    init(Live2Dglno);

    function init(i: number = 0){
        modelId[i] = LIVE2DDEFINE.MODELS_NAME[i];
        modelDef[i] = LIVE2DDEFINE.MODELS_DEFINE[modelId[i]];
            // Create app.
        app = new PIXI.Application(modelDef[i].Canvas._width,
            modelDef[i].Canvas._height, {backgroundColor : modelDef[i].Canvas._bgcolor});
        app.view.id = modelDef[i].Canvas._id;

        PIXI.loader.add(`ModelJson_${modelDef[i].Canvas._id}`, modelDef[i].Model._filepath + modelDef[i].Model._modeljson,
            { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
        PIXI.loader.load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
            modelInfo = resources[`ModelJson_${modelDef[i].Canvas._id}`].data.FileReferences;

            Live2Dcanvas[i] = new PIXI_LIVE2D.Live2DPixiModel(
                app, loader, modelInfo, modelId[i], modelDef[i].Canvas, modelDef[i].Model);

            document.body.appendChild(app.view);
        });
    }

    // Animation Change
    let cnt : number = 0;

    document.getElementById("changeMotion").addEventListener("click", () => {
        cnt++;
        if(cnt >= modelInfo.Motions.length){
            cnt = 0;
        }
        Live2Dcanvas[Live2Dglno].playAnimation(cnt);
        document.getElementById("motionNm").innerText = `motion${cnt} playing`;
    }, false);

    // Loop On/Off
    document.getElementById("changeLoop").addEventListener("click", () => {
        Live2Dcanvas[Live2Dglno].setLoop(false);
    }, false);

    document.getElementById("deletebtn").addEventListener("click", () => {
        let ele = document.getElementById(modelDef[Live2Dglno].Canvas._id);
        document.body.removeChild(ele);
        Live2Dcanvas[Live2Dglno].destroy();
        Live2Dglno--;
    });

    document.getElementById("changeChara").addEventListener("click", () => {
        Live2Dglno++;
        init(Live2Dglno);
    });

    document.getElementById("changeColor").addEventListener("click", () => {

    });
});
