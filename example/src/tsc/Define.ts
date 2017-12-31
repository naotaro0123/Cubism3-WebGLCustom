export namespace LIVE2DDEFINE
{
    export class UNIT
    {
        Model: MODEL;
        Canvas: CANVAS;
    }

    export class MODEL
    {
        _filepath: string;
        _modeljson: string;
    }

    export class CANVAS
    {
        _id: string = "glcanvas";
        _width: number = 400;
        _height: number = 400;
        _x: number = 200;
        _y: number = 300;
        _scaleX: number = 400;
        _scaleY: number = 400;
        _bgcolor: any = 0x1099bb;
    }

    export const MODELS_DEFINE : any = {};

    export const MODELS_NAME : any = [
        "haru", 'koharu', 'unitychan'
    ];

    MODELS_DEFINE[MODELS_NAME[0]] = new UNIT();
    MODELS_DEFINE[MODELS_NAME[0]].Model = new MODEL();
    MODELS_DEFINE[MODELS_NAME[0]].Canvas = new CANVAS();
    MODELS_DEFINE[MODELS_NAME[0]].Model._filepath = "../assets/haru/";
    MODELS_DEFINE[MODELS_NAME[0]].Model._modeljson = "haru.model3.json";

    MODELS_DEFINE[MODELS_NAME[1]] = new UNIT();
    MODELS_DEFINE[MODELS_NAME[1]].Model = new MODEL();
    MODELS_DEFINE[MODELS_NAME[1]].Canvas = new CANVAS();
    MODELS_DEFINE[MODELS_NAME[1]].Model._filepath = "../assets/koharu/";
    MODELS_DEFINE[MODELS_NAME[1]].Model._modeljson = "koharu.model3.json";

    MODELS_DEFINE[MODELS_NAME[2]] = new UNIT();
    MODELS_DEFINE[MODELS_NAME[2]].Model = new MODEL();
    MODELS_DEFINE[MODELS_NAME[2]].Canvas = new CANVAS();
    MODELS_DEFINE[MODELS_NAME[2]].Model._filepath = "../assets/unitychan/";
    MODELS_DEFINE[MODELS_NAME[2]].Model._modeljson = "unitychan.model3.json";
}

// // モデルName
// export const MODEL_NAME : any = [
//     "haru", 'koharu', 'unitychan'
// ];
// // Canvas設定
// export const CANVAS_DEFINE : any = {};
// // Live2Dモデルの配列
// export let MODEL_DEFINE : any = {};

// CANVAS_DEFINE[MODEL_NAME[0]] = {
//     "id" : "glcanvas",
//     "width" : 400,
//     "height" : 400,
//     "x" : 200,
//     "y" : 300,
//     "scaleX" : 400,
//     "scaleY" : 400,
//     "backgroundcolor" : 0x1099bb,
// };
// MODEL_DEFINE[MODEL_NAME[0]] = {
//     "filepath": "../assets/haru/",
//     "modeljson": "haru.model3.json"
// };

// CANVAS_DEFINE['koharu'] = {
//     "id" : "glcanvas",
//     "name" : "koharu",
//     "width" : 400,
//     "height" : 400,
//     "x" : 200,
//     "y" : 300,
//     "scaleX" : 400,
//     "scaleY" : 400,
//     "backgroundcolor" : 0x1099bb,
// };
// MODEL_DEFINE['koharu'] = {
//     "filepath": "../assets/koharu/",
//     "modeljson": "koharu.model3.json"
// };

// CANVAS_DEFINE['unitychan'] = {
//     "id" : "glcanvas",
//     "name" : "unitychan",
//     "width" : 400,
//     "height" : 400,
//     "x" : 200,
//     "y" : 300,
//     "scaleX" : 400,
//     "scaleY" : 400,
//     "backgroundcolor" : 0x1099bb,
// };
// MODEL_DEFINE['unitychan'] = {
//     "filepath": "../assets/unitychan/",
//     "modeljson": "unitychan.model3.json"
// };