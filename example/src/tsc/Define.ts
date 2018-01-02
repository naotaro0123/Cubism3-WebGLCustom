export namespace LIVE2DDEFINE
{
    export class UNIT
    {
        Model: MODEL;
        Canvas: CANVAS;
    }

    export class MODEL
    {
        _commonpath: string;
        _emptymotion: string;
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
        _scale: number = 400;
    }

    export const MODELS_DEFINE : any = {};

    export const MODELS_NAME : any = [
        "haru", 'koharu', 'unitychan'
    ];


    function modelset(i: number, name: string)
    {
        MODELS_DEFINE[name] = new UNIT();
        MODELS_DEFINE[name].Model = new MODEL();
        MODELS_DEFINE[name].Canvas = new CANVAS();
        MODELS_DEFINE[name].Canvas._id = `glcanvas_${name}_${i}`;
        MODELS_DEFINE[name].Model._commonpath = `../assets/common/`;
        MODELS_DEFINE[name].Model._emptymotion = `empty.motion3.json`;
        MODELS_DEFINE[name].Model._filepath = `../assets/${name}/`;
        MODELS_DEFINE[name].Model._modeljson = `${name}.model3.json`;
    }

    let index: number = 0;
    let id: string = MODELS_NAME[index];

    modelset(index, id);

    index++;
    id = MODELS_NAME[index];
    modelset(index, id);

    index++;
    id = MODELS_NAME[index];
    modelset(index, id);

}
