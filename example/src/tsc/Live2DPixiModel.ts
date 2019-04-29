import { LIVE2DDEFINE } from './Define';
import { LIVE2DAUDIO } from './Audio';


export namespace PIXI_LIVE2D {
  export class Live2DPixiModel {
    private _app: PIXI.Application;
    private _model_info: any;
    private _canvas_def: LIVE2DDEFINE.CANVAS;
    private _model_def: LIVE2DDEFINE.MODEL;
    private _moc: any;
    private _modelbuilder: LIVE2DCUBISMPIXI.ModelBuilder;
    private _animations: LIVE2DCUBISMFRAMEWORK.Animation[] = [];
    private _emptyanims: LIVE2DCUBISMFRAMEWORK.Animation[] = [];
    private _webAudio: LIVE2DAUDIO.Audio;
    private _model: LIVE2DCUBISMPIXI.Model;
    private _model_id: string;
    private _loader: PIXI.loaders.Loader;
    private _mouse_x: number = 0;   // マウス座標X
    private _mouse_y: number = 0;   // マウス座標Y
    private _pos_x: number = 0;     // 正規化したマウス座標X
    private _pos_y: number = 0;     // 正規化したマウス座標Y
    private _param_angle_x: number;  // PARAM_ANGLE_XのIndex
    private _param_angle_y: number;  // PARAM_ANGLE_YのIndex
    private _param_body_angle_x: number; // PARAM_BODY_ANGLE_XのIndex
    private _param_eye_ball_x: number;    // PARAM_EYE_BALL_XのIndex
    private _param_eye_ball_y: number;    // PARAM_EYE_BALL_YのIndex
    private _param_mouth_open_y: number; // PARAM_MOUTH_OPEN_YのIndex
    private _dragging: boolean = false;

    constructor(app: PIXI.Application, loader: PIXI.loaders.Loader, webAudio: LIVE2DAUDIO.Audio,
      model_info: any, model_id: string, canvas_def: LIVE2DDEFINE.CANVAS,
      model_def: LIVE2DDEFINE.MODEL) {
        this._app = app;
        this._loader = loader;
        this._webAudio = webAudio;
        this._model_info = model_info;
        this._model_id = model_id;
        this._canvas_def = canvas_def;
        this._model_def = model_def;
        this.init();
    }

    init() {
      this.loadMoc();
      this.loadTextures();
      this.loadMotions();
      this.loadPhysics();
      this.loadAudios();
      PIXI.loader.load((loader: PIXI.loaders.Loader, resources: PIXI.loaders.ResourceDictionary) => {
        this.loadResources(resources);
        this.loadAnimations(resources);
        this.playAnimation(0);
        this.rePosition();
        this.onDragEvent();
        this.playLipsync();
        this.resize();
        window.onresize = this.resize;
        this.tick();
      });
    }

    loadMoc() {
      PIXI.loader.add(`Moc_${this._canvas_def._id}`, this._model_def._filepath + this._model_info.Moc,
        { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER });
    }

    loadTextures() {
      for (let i = 0; i < this._model_info.Textures.length; i++) {
        PIXI.loader.add(`Texture${i}_${this._canvas_def._id}`, this._model_def._filepath + this._model_info.Textures[i]);
      }
    }

    loadMotions() {
      // Drag追従とLipSync用の空モーションをロード
      PIXI.loader.add(`Empty_${this._canvas_def._id}`, this._model_def._commonpath + this._model_def._emptymotion,
      { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });

      if (this._model_info.Motions !== void 0) {
        for (let i = 0; i < this._model_info.Motions.length; i++) {
          PIXI.loader.add(`Motion${i}_${this._canvas_def._id}`, this._model_def._filepath + this._model_info.Motions[i],
            { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
        }
      }
    }

    loadPhysics() {
      if (this._model_info.Physics !== void 0) {
        PIXI.loader.add(`Physics_${this._canvas_def._id}`, this._model_def._filepath + this._model_info.Physics,
        { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
      }
    }

    loadAudios(){
      if (this._model_info.Audios !== void 0) {
        for (let i = 0; i < this._model_info.Audios.length; i++) {
          this._webAudio.setAudio(i, this._model_def._filepath + this._model_info.Audios[i]);
        }
      }
    }

    loadResources(_resources: PIXI.loaders.ResourceDictionary) {
      // Load moc.
      this._moc = Live2DCubismCore.Moc.fromArrayBuffer(_resources[`Moc_${this._canvas_def._id}`].data);
      this._modelbuilder = new LIVE2DCUBISMPIXI.ModelBuilder();
      this._modelbuilder.setMoc(this._moc)
        .setTimeScale(1);
      // Texture
      for (let i = 0; i < this._model_info.Textures.length; i++) {
        this._modelbuilder.addTexture(i, _resources[`Texture${i}_${this._canvas_def._id}`].texture);
      }
      // Motion
      this._modelbuilder.addAnimatorLayer(`Base_${this._canvas_def._id}`,
        LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
      // Lipsync Motion
      this._modelbuilder.addAnimatorLayer(`Lipsync_${this._canvas_def._id}`,
        LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
      // Drag Motion
      this._modelbuilder.addAnimatorLayer(`Drag_${this._canvas_def._id}`,
        LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1);
      // PhySics
      if(_resources[`Physics_${this._canvas_def._id}`] !== void 0) {
        this._modelbuilder.setPhysics3Json(_resources[`Physics_${this._canvas_def._id}`].data);
      }

      this._model = this._modelbuilder.build();
      // Add model to stage.
      this._app.stage.addChild(this._model);
      this._app.stage.addChild(this._model.masks);
    }

    loadAnimations(_resources: PIXI.loaders.ResourceDictionary) {
      for (let k = 0; k < 2; k++) {
        this._emptyanims[k] =
          LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(_resources[`Empty_${this._canvas_def._id}`].data);
      }

      // Load animation.
      if (this._model_info.Motions !== void 0) {
        for (let i = 0; i < this._model_info.Motions.length; i++) {
          this._animations[i] =
            LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(_resources[`Motion${i}_${this._canvas_def._id}`].data);
        }
      }
    }

    onDragEvent() {
      this._param_angle_x = this._model.parameters.ids.indexOf("PARAM_ANGLE_X");
      this._param_angle_y = this._model.parameters.ids.indexOf("PARAM_ANGLE_Y");
      this._param_body_angle_x = this._model.parameters.ids.indexOf("PARAM_BODY_ANGLE_X");
      this._param_eye_ball_x = this._model.parameters.ids.indexOf("PARAM_EYE_BALL_X");
      this._param_eye_ball_y = this._model.parameters.ids.indexOf("PARAM_EYE_BALL_Y");

      this._app.view.addEventListener('pointerdown', this._onDragStart.bind(this), false);
      this._app.view.addEventListener('pointerup', this._onDragEnd.bind(this), false);
      this._app.view.addEventListener('pointerout', this._onDragEnd.bind(this), false);
      this._app.view.addEventListener('pointermove', this._onDragMove.bind(this), false);
    }

    _onDragStart(event: any) {
      this._dragging = true;
    }

    _onDragEnd(event: any) {
      this._dragging = false;
      this._pos_x = 0.0;
      this._pos_y = 0.0;
    }

    _onDragMove(event: any) {
      // if(this._dragging){
      // ドラッグ用にマウス座標を取得（offsetはクリックした位置）
      this._mouse_x = this._model.position.x - event.offsetX;
      this._mouse_y = this._model.position.y - event.offsetY;

      // マウス座標を-1.0〜1.0に正規化
      let height = this._app.screen.height / 2;
      let width = this._app.screen.width / 2;
      let scale = 1.0 - (height / this._canvas_def._scale);
      this._pos_x = - this._mouse_x / height;
      // Yは頭の位置分を調整
      this._pos_y = - (this._mouse_y / width) + scale;
      // }
    }

    playAnimation(i: number) {
      // Play animation.
      this._model.animator.getLayer(`Base_${this._canvas_def._id}`).play(this._animations[i]);
    }

    playLipsync() {
      this._emptyanims[0].evaluate = (time, weight, blend, target) => {
        this._param_mouth_open_y = target.parameters.ids.indexOf("PARAM_MOUTH_OPEN_Y");
        if (this._param_mouth_open_y >= 0) {
          // const sample = (Math.sin(time*9.543)+1 + Math.sin(time*13.831))/2;
          const sample = this._webAudio.getVolume();
          target.parameters.values[this._param_mouth_open_y] =
          blend(target.parameters.values[this._param_mouth_open_y], sample, 0);
        }
      }
      this._model.animator.getLayer(`Lipsync_${this._canvas_def._id}`).play(this._emptyanims[0]);
    }

    stopLipsync() {
      this._model.animator.getLayer(`Lipsync_${this._canvas_def._id}`).stop();
    }

    stopAnimation() {
      this._model.animator.getLayer(`Base_${this._canvas_def._id}`).stop();
    }

    setLoop(loop: boolean) {
      this._model.animator.getLayer(`Base_${this._canvas_def._id}`).currentAnimation.loop = loop;
    }

    playAudio(audioCnt: number) {
      this._webAudio.play(audioCnt);
    }

    stopAudio() {
      this._webAudio.stop();
    }

    tick() {
      // Set up ticker.
      this._app.ticker.add((deltaTime) => {
        this.resize();
        this.rePosition();
        this._updateParameter();
        // 音声をビジュアライズする
        this._webAudio.visuaLize();

        this._model.update(deltaTime);
        this._model.masks.update(this._app.renderer);
      });
    }

    _updateParameter() {
      this._emptyanims[1].evaluate = (time, weight, blend, target) => {
        // angle_x
        if (this._param_angle_x >= 0) {
          target.parameters.values[this._param_angle_x] =
            blend(target.parameters.values[this._param_angle_x], this._pos_x * 30, 0);
        }
        // angle_y
        if (this._param_angle_y >= 0) {
          target.parameters.values[this._param_angle_y] =
            blend(target.parameters.values[this._param_angle_y], -this._pos_y * 30, 0);
        }
        // body_angle_x
        if (this._param_body_angle_x >= 0) {
          target.parameters.values[this._param_body_angle_x] =
            blend(target.parameters.values[this._param_body_angle_x], this._pos_x * 10, 0);
        }
        // eye_ball_x
        if (this._param_eye_ball_x >= 0) {
          target.parameters.values[this._param_eye_ball_x] =
            blend(target.parameters.values[this._param_eye_ball_x], this._pos_x, 0);
        }
        // eye_ball_y
        if (this._param_eye_ball_y >= 0) {
          target.parameters.values[this._param_eye_ball_y] =
            blend(target.parameters.values[this._param_eye_ball_y], -this._pos_y, 0);
        }
      }
      this._model.animator.getLayer(`Drag_${this._canvas_def._id}`).play(this._emptyanims[1]);
    }

    changeBlend(i: number) {
      if (i % 2 === 0) {
        this._model.animator.getLayer(`Base_${this._canvas_def._id}`).blend =
          LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.ADD;
      }else{
        this._model.animator.getLayer(`Base_${this._canvas_def._id}`).blend =
          LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE;
      }
    }

    changeOpacity(opacity: string) {
      this._app.view.style.opacity = opacity;
    }

    getAudioAccess() {
      this._webAudio.getAudioAccess();
    }

    setTickSpeed(speed: number = 1) {
      this._app.ticker.speed = speed;
    }

    showTickFPS() {
      console.log(this._app.ticker.FPS);
    }

    rePosition(positionX: number = this._canvas_def._x,
      positionY: number = this._canvas_def._y,
      scale: number = this._canvas_def._scale) {
      this._canvas_def._x = positionX;
      this._canvas_def._y = positionY;
      this._canvas_def._scale = scale;
      // Resize model.
      this._model.position = new PIXI.Point(positionX, positionY);
      this._model.scale = new PIXI.Point(scale, scale);
    }

    resize() {
      let width = this._canvas_def._width;
      let height = this._canvas_def._height;
      // Resize app.
      this._app.view.style.width = `${width}px`;
      this._app.view.style.height = `${height}px`;
      this._app.renderer.resize(width, height);
      // Resize mask texture.
      this._model.masks.resize(this._app.view.width, this._app.view.height);
    }

    destroy() {
      this.stopAnimation();
      this._app.ticker.stop();
      this._loader.reset();
      this._app.destroy();
    }
  }
}
