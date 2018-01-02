import { LIVE2DDEFINE } from './Define';
import { LIVE2DSOUND } from './Sound';


export namespace PIXI_LIVE2D {
    export class Live2DPixiModel {
        private _app: PIXI.Application;
        private _modelInfo: any;
        private _canvasDefine: LIVE2DDEFINE.CANVAS;
        private _modelDefine: LIVE2DDEFINE.MODEL;
        private _moc: any;
        private _modelbuilder: LIVE2DCUBISMPIXI.ModelBuilder;
        private _animations: LIVE2DCUBISMFRAMEWORK.Animation[];
        private _sounds: LIVE2DSOUND.Sound[] = [];
        private _model: LIVE2DCUBISMPIXI.Model;
        private _modelId: string;
        private _loader: PIXI.loaders.Loader;
        private _mouse_x: number = 0;   // マウス座標X
        private _mouse_y: number = 0;   // マウス座標Y
        private _pos_x: number = 0;     // 正規化したマウス座標X
        private _pos_y: number = 0;     // 正規化したマウス座標Y
        private _parameterIndexAngleX: number;  // PARAM_ANGLE_XのIndex
        private _parameterIndexAngleY: number;  // PARAM_ANGLE_YのIndex
        private _parameterIndexBodyAngleX: number; // PARAM_BODY_ANGLE_XのIndex
        private _parameterIndexEyeX: number;    // PARAM_EYE_BALL_XのIndex
        private _parameterIndexEyeY: number;    // PARAM_EYE_BALL_YのIndex
        private _parameterIndexMouthOpenY: number; // PARAM_MOUTH_OPEN_YのIndex
        private _dragging: boolean = false;

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
            this.loadSounds();
            PIXI.loader.load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
                this.loadResources(resources);
                this.loadAnimations(resources);
                this.playAnimation(0);
                this.rePosition();
                this.onDragEvent();

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
            for(let i = 0; i < this._modelInfo.Textures.length; i++)
            {
                PIXI.loader.add(`Texture${i}_${this._canvasDefine._id}`, this._modelDefine._filepath + this._modelInfo.Textures[i]);
            }
        }

        loadMotions(){
            if(this._modelInfo.Motions !== void 0){
                for(let i = 0; i < this._modelInfo.Motions.length; i++)
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

        loadSounds(){
            if(this._modelInfo.Sounds !== void 0){
                for(let i = 0; i < this._modelInfo.Sounds.length; i++)
                {
                    PIXI.loader.add(`Sound${i}_${this._canvasDefine._id}`, this._modelDefine._filepath + this._modelInfo.Sounds[i],
                                    { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER });
                }
            }
        }

        loadResources(_resources: PIXI.loaders.ResourceDictionary){
            // Load moc.
            this._moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(_resources[`Moc_${this._canvasDefine._id}`].data);
            this._modelbuilder = new LIVE2DCUBISMPIXI.ModelBuilder();
            this._modelbuilder.setMoc(this._moc)
                                .setTimeScale(1);
            // Texture
            for(let i = 0; i < this._modelInfo.Textures.length; i++)
            {
                this._modelbuilder.addTexture(i, _resources[`Texture${i}_${this._canvasDefine._id}`].texture);
            }
            // Motion
            this._modelbuilder.addAnimatorLayer(`Base_${this._canvasDefine._id}`,
                LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
            this._modelbuilder.addAnimatorLayer(`Lipsync_${this._canvasDefine._id}`,
            LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
            // PhySics
            if(_resources[`Physics_${this._canvasDefine._id}`] !== void 0){
                this._modelbuilder.setPhysics3Json(_resources[`Physics_${this._canvasDefine._id}`].data);
            }
            // Sounds
            if(this._modelInfo.Sounds !== void 0){
                for(let i = 0; i < this._modelInfo.Sounds.length; i++){
                    this._sounds[i] = new LIVE2DSOUND.Sound(_resources[`Sound${i}_${this._canvasDefine._id}`].data);
                }
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
                for(let i = 0; i < this._modelInfo.Motions.length; i++)
                {
                    this._animations[i] =
                        LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(_resources[`Motion${i}_${this._canvasDefine._id}`].data);
                }
            }
        }

        onDragEvent(){
            this._parameterIndexAngleX = this._model.parameters.ids.indexOf("PARAM_ANGLE_X");
            this._parameterIndexAngleY = this._model.parameters.ids.indexOf("PARAM_ANGLE_Y");
            this._parameterIndexBodyAngleX = this._model.parameters.ids.indexOf("PARAM_BODY_ANGLE_X");
            this._parameterIndexEyeX = this._model.parameters.ids.indexOf("PARAM_EYE_BALL_X");
            this._parameterIndexEyeY = this._model.parameters.ids.indexOf("PARAM_EYE_BALL_Y");

            this._app.view.addEventListener('pointerdown', this._onDragStart.bind(this), false);
            this._app.view.addEventListener('pointerup', this._onDragEnd.bind(this), false);
            this._app.view.addEventListener('pointerout', this._onDragEnd.bind(this), false);
            this._app.view.addEventListener('pointermove', this._onDragMove.bind(this), false);
        }

        _onDragStart(event: any){
            this._dragging = true;
        }

        _onDragEnd(event: any){
            this._dragging = false;
            this._pos_x = 0.0;
            this._pos_y = 0.0;
        }

        _onDragMove(event: any){
            // if(this._dragging){
                // ドラッグ用にマウス座標を取得（offsetはクリックした位置）
                this._mouse_x = this._model.position.x - event.offsetX;
                this._mouse_y = this._model.position.y - event.offsetY;

                // マウス座標を-1.0〜1.0に正規化
                let height = this._app.screen.height / 2;
                let width = this._app.screen.width / 2;
                let scale = 1.0 - (height / this._canvasDefine._scale);
                this._pos_x = - this._mouse_x / height;
                // Yは頭の位置分を調整
                this._pos_y = - (this._mouse_y / width) + scale;

            // }
        }

        playAnimation(i: number){
            // Play animation.
            this._model.animator.getLayer(`Base_${this._canvasDefine._id}`).play(this._animations[i]);
        }

        playLipsync(){
            this._animations[0].evaluate = (time, weight, blend, target) => {
                this._parameterIndexMouthOpenY = target.parameters.ids.indexOf("PARAM_MOUTH_OPEN_Y");
                if (this._parameterIndexMouthOpenY >= 0) {
                    const sample = (Math.sin(time*9.543)+1 + Math.sin(time*13.831))/2;
                    target.parameters.values[this._parameterIndexMouthOpenY] =
                    blend(target.parameters.values[this._parameterIndexMouthOpenY], sample, weight);
                }
            }
            this._model.animator.getLayer(`Lipsync_${this._canvasDefine._id}`).play(this._animations[0]);
        }

        stopAnimation(){
            this._model.animator.getLayer(`Base_${this._canvasDefine._id}`).stop();
        }

        setLoop(loop : boolean){
            this._model.animator.getLayer(`Base_${this._canvasDefine._id}`).currentAnimation.loop = loop;
        }

        playSound(i: number){
            this._sounds[i].play();
        }

        stopSound(i: number){
            this._sounds[i].stop();
        }

        tick(){
            // Set up ticker.
            this._app.ticker.add((deltaTime) => {
                this.resize();
                this.rePosition();
                this._updateParameter();

                this._model.update(deltaTime);
                this._model.masks.update(this._app.renderer);

            });
        }

        _updateParameter(){
            if(this._parameterIndexAngleX >= 0){
                this._model.parameters.values[this._parameterIndexAngleX] = this._pos_x * 30;
            }
            if(this._parameterIndexAngleY >= 0){
                this._model.parameters.values[this._parameterIndexAngleY] = -this._pos_y * 30;
            }
            if(this._parameterIndexBodyAngleX >= 0){
                this._model.parameters.values[this._parameterIndexBodyAngleX] = this._pos_x * 10;
            }
            if(this._parameterIndexEyeX >= 0){
                this._model.parameters.values[this._parameterIndexEyeX] = this._pos_x;
            }
            if(this._parameterIndexEyeY >= 0){
                this._model.parameters.values[this._parameterIndexEyeY] = -this._pos_y;
            }
        }

        changeBlend(i: number){
            if(i % 2 == 0){
                this._model.animator.getLayer(`Base_${this._canvasDefine._id}`).blend =
                LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD;
            }else{
                this._model.animator.getLayer(`Base_${this._canvasDefine._id}`).blend =
                LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
            }
        }

        changeOpacity(opacity: string)
        {
            this._app.view.style.opacity = opacity;
        }

        setTickSpeed(speed: number = 1){
            this._app.ticker.speed = speed;
        }

        showTickFPS(){
            console.log(this._app.ticker.FPS);
        }

        rePosition(positionX: number = this._canvasDefine._x,
            positionY: number = this._canvasDefine._y,
            scale: number = this._canvasDefine._scale)
        {
            this._canvasDefine._x = positionX;
            this._canvasDefine._y = positionY;
            this._canvasDefine._scale = scale;
            // Resize model.
            this._model.position = new PIXI.Point(positionX, positionY);
            this._model.scale = new PIXI.Point(scale, scale);

        }

        resize(){
            let width = this._canvasDefine._width;
            let height = this._canvasDefine._height;
            // Resize app.
            this._app.view.style.width = `${width}px`;
            this._app.view.style.height = `${height}px`;
            this._app.renderer.resize(width, height);
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
