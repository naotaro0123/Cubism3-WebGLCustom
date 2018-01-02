export namespace LIVE2DSOUND
{
    export class Sound {
        private _snd : HTMLAudioElement;

        constructor(snd: HTMLAudioElement)
        {
            this._snd = snd;
        }

        play(){
            this._snd.play();
        }

        stop(){
            this._snd.pause();
            this._snd.currentTime = 0;
        }

        volume(){
            return this._snd.volume;
        }
    }
}