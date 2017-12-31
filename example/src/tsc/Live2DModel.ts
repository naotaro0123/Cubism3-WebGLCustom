import { LIVE2DDEFINE } from './Define';


export namespace PIXI_LIVE2D {
    export class Live2DPixiModel {
        private _app: PIXI.Application;
        private _modelInfo: any;
        private _canvasDefine: LIVE2DDEFINE.CANVAS;
        private _modelDefine: LIVE2DDEFINE.MODEL;
        private _moc: any;
        private _modelbuilder: LIVE2DCUBISMPIXI.ModelBuilder;
        private _animations: LIVE2DCUBISMFRAMEWORK.Animation[];
        private _model: LIVE2DCUBISMPIXI.Model;
        private _modelId: string;
        private _loader: PIXI.loaders.Loader;

        constructor(app: PIXI.Application, loader: PIXI.loaders.Loader, modelInfo: any,
            modelId: string, canvasDefine: LIVE2DDEFINE.CANVAS, modelDefine: LIVE2DDEFINE.MODEL){
            this._app = app;
            this._loader = loader;
            this._modelInfo = modelInfo;
            this._modelId = modelId;
            this._canvasDefine = canvasDefine;
            this._modelDefine = modelDefine;
            this.init();
        }

        init(){
            this.loadMoc();
            this.loadTextures();
            this.loadMotions();
            this.loadPhysics();
            PIXI.loader.load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
                this.loadResources(resources);
                this.loadAnimations(resources);
                this.playAnimation(0);
                this.resize();
                window.onresize = this.resize;
                this.tick();
            });
        }

        loadMoc(){
            PIXI.loader.add(`Moc_${this._canvasDefine._id}`, this._modelDefine._filepath + this._modelInfo.Moc,
                { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER });
        }

        loadTextures(){
            for(var i = 0; i < this._modelInfo.Textures.length; i++)
            {
                PIXI.loader.add(`Texture${i}_${this._canvasDefine._id}`, this._modelDefine._filepath + this._modelInfo.Textures[i]);
            }
        }

        loadMotions(){
            if(this._modelInfo.Motions !== void 0){
                for(var i = 0; i < this._modelInfo.Motions.length; i++)
                {
                    PIXI.loader.add(`Motion${i}_${this._canvasDefine._id}`, this._modelDefine._filepath + this._modelInfo.Motions[i],
                                    { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
                }
            }
        }

        loadPhysics(){
            if(this._modelInfo.Physics !== void 0){
                PIXI.loader.add(`Physics_${this._canvasDefine._id}`, this._modelDefine._filepath + this._modelInfo.Physics,
                { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
            }
        }

        loadResources(_resources: PIXI.loaders.ResourceDictionary){
            // Load moc.
            this._moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(_resources[`Moc_${this._canvasDefine._id}`].data);
            this._modelbuilder = new LIVE2DCUBISMPIXI.ModelBuilder();
            this._modelbuilder.setMoc(this._moc)
                                .setTimeScale(1);
            // Texture
            for(var i =0; i < this._modelInfo.Textures.length; i++)
            {
                this._modelbuilder.addTexture(i, _resources[`Texture${i}_${this._canvasDefine._id}`].texture);
            }
            // Motion
            this._modelbuilder.addAnimatorLayer(`Base_${this._canvasDefine._id}`,
                LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
            // PhySics
            if(_resources[`Physics_${this._canvasDefine._id}`] !== void 0){
                this._modelbuilder.setPhysics3Json(_resources[`Physics_${this._canvasDefine._id}`].data);
            }
            this._model = this._modelbuilder.build();
            // Add model to stage.
            this._app.stage.addChild(this._model);
            this._app.stage.addChild(this._model.masks);

        }

        loadAnimations(_resources: PIXI.loaders.ResourceDictionary){
            // Load animation.
            this._animations = [];
            if(this._modelInfo.Motions !== void 0){
                for(var i = 0; i < this._modelInfo.Motions.length; i++)
                {
                    this._animations[i] =
                        LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(_resources[`Motion${i}_${this._canvasDefine._id}`].data);
                }
            }
        }

        playAnimation(i: number){
            // Play animation.
            this._model.animator.getLayer(`Base_${this._canvasDefine._id}`).play(this._animations[i]);
        }

        stopAnimation(){
            this._model.animator.getLayer(`Base_${this._canvasDefine._id}`).stop();
        }

        setLoop(loop : boolean){
            this._model.animator.getLayer(`Base_${this._canvasDefine._id}`).currentAnimation.loop = loop;
        }

        tick(){
            // Set up ticker.
            this._app.ticker.add((deltaTime) => {
                this._model.update(deltaTime);
                this._model.masks.update(this._app.renderer);
                // console.log("tick");
            });
        }
        changeColor(r: any, g: any, b: any){

        }

        setTickSpeed(speed: number = 1){
            this._app.ticker.speed = speed;
        }

        showTickFPS(){
            console.log(this._app.ticker.FPS);
        }

        resize(){
            let width = this._canvasDefine._width;
            let height = this._canvasDefine._height;
            // Resize app.
            this._app.view.style.width = `${width}px`;
            this._app.view.style.height = `${height}px`;
            this._app.renderer.resize(width, height);
            // Resize model.
            // model.position = new PIXI.Point((width * 0.5), (height * 0.5));
            this._model.position = new PIXI.Point(this._canvasDefine._x, this._canvasDefine._y);
            // model.scale = new PIXI.Point((model.position.x * 0.8), (model.position.x * 0.8));
            this._model.scale = new PIXI.Point(this._canvasDefine._scaleX, this._canvasDefine._scaleY);
            // Resize mask texture.
            this._model.masks.resize(this._app.view.width, this._app.view.height);
        }

        destroy(){
            this.stopAnimation();
            this._app.ticker.stop();
            this._loader.reset();
            this._app.destroy();
        }
    }
}
