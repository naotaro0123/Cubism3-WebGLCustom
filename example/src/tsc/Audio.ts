export namespace LIVE2DAUDIO {
  export class Audio {
    private _audioNames: string[] = [];
    private _audioCtx: AudioContext;
    private _soundSource: AudioBufferSourceNode;    // 音声ファイル用
    private _sourceNode: MediaStreamAudioSourceNode; // マイク音声用
    private _analyser: AnalyserNode;
    private _bufferLengthAlt: number;
    private _dataArrayAlt: Uint8Array;
    private _audioCanvas: HTMLCanvasElement;
    private _audioCanvasCtx: CanvasRenderingContext2D;
    private _volume: number = 0;

    constructor() {
      this._audioCtx = new AudioContext();
      this.initCanvas();
    }

    initCanvas() {
      // ビジュアライズ用のCanvas
      this._audioCanvas = <HTMLCanvasElement>document.getElementById('visualizer');
      this._audioCanvasCtx = this._audioCanvas.getContext('2d');
      this._audioCanvasCtx.clearRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
      this._audioCanvasCtx.fillStyle = 'rgb(0, 0, 0)';
      this._audioCanvasCtx.fillRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
    }

    setAudio(index: number, audioName: string) {
      this._audioNames[index] = audioName;
    }

    play(index: number) {
      // サウンドを読み込む
      fetch(this._audioNames[index]).then(response => {
        return response.arrayBuffer();
      }).then((arraybuffer) => {
        return this._audioCtx.decodeAudioData(arraybuffer);
      }).then((buffer) => {
        // サウンド再生
        this.playSound(buffer);
      });
    }

    getAudioAccess() {
      // https://1000ch.net/posts/2017/visualize-audio-input.html
      navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      }).then(stream => {
        this._sourceNode = this._audioCtx.createMediaStreamSource(stream);
        // 音声解析用
        this._analyser = this._audioCtx.createAnalyser();
        this._bufferLengthAlt = this._analyser.fftSize;
        this._dataArrayAlt = new Uint8Array(this._bufferLengthAlt);
        this._sourceNode.connect(this._analyser);
      }).catch(error => {
        console.log(error);
      });
    }

    // サウンド再生
    playSound(buffer: AudioBuffer) {
      this._soundSource = this._audioCtx.createBufferSource();
      this._soundSource.buffer = buffer;
      // 音声解析用
      this._analyser = this._audioCtx.createAnalyser();
      this._bufferLengthAlt = this._analyser.frequencyBinCount;
      this._dataArrayAlt = new Uint8Array(this._bufferLengthAlt);
      this._soundSource.connect(this._analyser);
      this._analyser.connect(this._audioCtx.destination);
      // 音声の再生
      this._soundSource.start();
    }

    // 音声をビジュアライズ表示する
    visuaLize() {
      if (this._analyser == null) return;
      // https://qiita.com/soarflat/items/4aa001dac115a4af6dbe
      // マイク用？（時間領域の波形データ）
      // this._analyser.getByteTimeDomainData(this._dataArrayAlt);
      // 音声ファイル用（周波数領域の波形データ）
      this._analyser.getByteFrequencyData(this._dataArrayAlt);
      // canvas初期化
      this._audioCanvasCtx.fillStyle = 'rgb(0, 0, 0)';
      this._audioCanvasCtx.fillRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
      let barWidth = 0;
      // let barHeight = (this._audioCanvas.width / this._bufferLengthAlt) * 150.0;
      let barHeight = (this._audioCanvas.width / this._bufferLengthAlt) * 300.0;
      let maxValue = 0;

      for (let i = 0; i < this._bufferLengthAlt; i++) {
        barWidth = this._dataArrayAlt[i]; // 波形データ 0 ~ 255が格納されている
        maxValue = maxValue > barWidth ? maxValue: barWidth;
        // Live2Dに渡すには0.0〜1.0に正規化
        this._volume = maxValue / 255;
        this._audioCanvasCtx.fillStyle = 'rgb(' + (barWidth + 100) + ',50, 50)';
        this._audioCanvasCtx.fillRect(0, 0, barWidth, barHeight);
      }
    }

    getVolume() {
      return this._volume;
    }

    stop() {
      // 音声の停止
      this._soundSource.stop();
    }
  }
}
