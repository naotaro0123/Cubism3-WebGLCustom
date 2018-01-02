import { LIVE2DDEFINE } from './Define';
import { PIXI_LIVE2D } from './Live2DPixiModel';


document.addEventListener("DOMContentLoaded", () => {
    let model_id: any = [];
    let model_def: any = [];
    let model_info: any;
    let app: PIXI.Application;
    let Live2d_no: number = 0;
    let Live2d_canvas: any = [];

    init(Live2d_no);

    function init(i: number = 0){
        model_id[i] = LIVE2DDEFINE.MODELS_NAME[i];
        model_def[i] = LIVE2DDEFINE.MODELS_DEFINE[model_id[i]];
        // Create app.
        app = new PIXI.Application(model_def[i].Canvas._width,
            model_def[i].Canvas._height, {transparent: true});
        app.view.id = model_def[i].Canvas._id;

        PIXI.loader.add(`ModelJson_${model_def[i].Canvas._id}`, model_def[i].Model._filepath + model_def[i].Model._modeljson,
            { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
        PIXI.loader.load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
            model_info = resources[`ModelJson_${model_def[i].Canvas._id}`].data.FileReferences;

            Live2d_canvas[i] = new PIXI_LIVE2D.Live2DPixiModel(
                app, loader, model_info, model_id[i], model_def[i].Canvas, model_def[i].Model);

            document.body.appendChild(app.view);
        });
    }

    // Animation Change
    let animCnt : number = 0;

    // モーション切り替え
    document.getElementById("changeMotion").addEventListener("click", () => {
        animCnt++;
        if(animCnt >= model_info.Motions.length){
            animCnt = 0;
        }
        changeLoop.innerHTML = "ループON";

        Live2d_canvas[Live2d_no].playAnimation(animCnt);
        document.getElementById("motionNm").innerText =
         `${model_info.Motions[animCnt]}`.replace("motions/","").replace(".motion3.json","");
    }, false);

    // モーションループ On/Off
    let changeLoop = document.getElementById("changeLoop");
    changeLoop.addEventListener("click", () => {
        if(changeLoop.innerHTML == "ループON"){
            changeLoop.innerHTML = "ループOFF";
        }else{
            changeLoop.innerHTML = "ループON";
        }
        Live2d_canvas[Live2d_no].setLoop(false);
    }, false);

    // モデル削除
    document.getElementById("deletebtn").addEventListener("click", () => {
        let ele = document.getElementById(model_def[Live2d_no].Canvas._id);
        document.body.removeChild(ele);
        Live2d_canvas[Live2d_no].destroy();
        Live2d_no--;
    });

    // キャラ切り替え
    document.getElementById("changeChara").addEventListener("click", () => {
        Live2d_no++;
        init(Live2d_no);
    });

    // 透明度
    let opacitySlider = <HTMLInputElement>document.getElementById("opacitySlider");
    opacitySlider.addEventListener("input", () => {
        Live2d_canvas[Live2d_no].changeOpacity(opacitySlider.value);
    });

    // 位置X
    let positionXSlider = <HTMLInputElement>document.getElementById("positionXSlider");
    positionXSlider.addEventListener("input", () => {
        Live2d_canvas[Live2d_no].rePosition(positionXSlider.value, positionYSlider.value, scaleSlider.value);
    });

    // 位置Y
    let positionYSlider = <HTMLInputElement>document.getElementById("positionYSlider");
    positionYSlider.addEventListener("input", () => {
        Live2d_canvas[Live2d_no].rePosition(positionXSlider.value, positionYSlider.value, scaleSlider.value);
    });

    // 拡大
    let scaleSlider = <HTMLInputElement>document.getElementById("scaleSlider");
    scaleSlider.addEventListener("input", () => {
        Live2d_canvas[Live2d_no].rePosition(positionXSlider.value, positionYSlider.value, scaleSlider.value);
    });

    // モーションスピード
    let speedSlider = <HTMLInputElement>document.getElementById("speedSlider");
    speedSlider.addEventListener("input", () => {
        Live2d_canvas[Live2d_no].setTickSpeed(speedSlider.value);
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
        Live2d_canvas[Live2d_no].changeBlend(blendCnt);
    }, false);

    let soundCnt : number = 0;
    // 音声切り替え
    document.getElementById("changeSound").addEventListener("click", () => {
        soundCnt++;
        if(soundCnt >= model_info.Sounds.length){
            soundCnt = 0;
        }

        Live2d_canvas[Live2d_no].playSound(soundCnt);

        document.getElementById("soundNm").innerHTML =
        `${model_info.Sounds[soundCnt]}`.replace("sounds/","").replace(".mp3","");

    }, false);
    // 音声停止
    document.getElementById("stopSound").addEventListener("click", () => {
        Live2d_canvas[Live2d_no].stopSound(soundCnt);
    });

    // リップシンク
    document.getElementById("changeLipsync").addEventListener("click", () => {
        Live2d_canvas[Live2d_no].playLipsync();
    });
});
