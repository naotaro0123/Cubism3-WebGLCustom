import { LIVE2DDEFINE } from './Define';
import { PIXI_LIVE2D } from './Live2DPixiModel';


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
            modelDef[i].Canvas._height, {transparent: true});
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
    let animCnt : number = 0;

    // モーション切り替え
    document.getElementById("changeMotion").addEventListener("click", () => {
        animCnt++;
        if(animCnt >= modelInfo.Motions.length){
            animCnt = 0;
        }
        changeLoop.innerHTML = "ループON";

        Live2Dcanvas[Live2Dglno].playAnimation(animCnt);
        document.getElementById("motionNm").innerText =
         `${modelInfo.Motions[animCnt]}`.replace("motions/","").replace(".motion3.json","");
    }, false);

    // モーションループ On/Off
    let changeLoop = document.getElementById("changeLoop");
    changeLoop.addEventListener("click", () => {
        if(changeLoop.innerHTML == "ループON"){
            changeLoop.innerHTML = "ループOFF";
        }else{
            changeLoop.innerHTML = "ループON";
        }
        Live2Dcanvas[Live2Dglno].setLoop(false);
    }, false);

    // モデル削除
    document.getElementById("deletebtn").addEventListener("click", () => {
        let ele = document.getElementById(modelDef[Live2Dglno].Canvas._id);
        document.body.removeChild(ele);
        Live2Dcanvas[Live2Dglno].destroy();
        Live2Dglno--;
    });

    // キャラ切り替え
    document.getElementById("changeChara").addEventListener("click", () => {
        Live2Dglno++;
        init(Live2Dglno);
    });

    // 透明度
    let opacitySlider = <HTMLInputElement>document.getElementById("opacitySlider");
    opacitySlider.addEventListener("input", () => {
        Live2Dcanvas[Live2Dglno].changeOpacity(opacitySlider.value);
    });

    // 位置X
    let positionXSlider = <HTMLInputElement>document.getElementById("positionXSlider");
    positionXSlider.addEventListener("input", () => {
        Live2Dcanvas[Live2Dglno].rePosition(positionXSlider.value, positionYSlider.value, scaleSlider.value);
    });

    // 位置Y
    let positionYSlider = <HTMLInputElement>document.getElementById("positionYSlider");
    positionYSlider.addEventListener("input", () => {
        Live2Dcanvas[Live2Dglno].rePosition(positionXSlider.value, positionYSlider.value, scaleSlider.value);
    });

    // 拡大
    let scaleSlider = <HTMLInputElement>document.getElementById("scaleSlider");
    scaleSlider.addEventListener("input", () => {
        Live2Dcanvas[Live2Dglno].rePosition(positionXSlider.value, positionYSlider.value, scaleSlider.value);
    });

    // モーションスピード
    let speedSlider = <HTMLInputElement>document.getElementById("speedSlider");
    speedSlider.addEventListener("input", () => {
        Live2Dcanvas[Live2Dglno].setTickSpeed(speedSlider.value);
    });

    let blendCnt : number = 1;
    // モーションブレンド
    let changeBlend = document.getElementById("changeBlend");
    changeBlend.addEventListener("click", () => {
        if(changeBlend.innerHTML == "ブレンドOVERRIDE"){
            changeBlend.innerHTML = "ブレンドADD";
        }else{
            changeBlend.innerHTML = "ブレンドOVERRIDE";
        }
        blendCnt++;
        Live2Dcanvas[Live2Dglno].changeBlend(blendCnt);
    }, false);
});
