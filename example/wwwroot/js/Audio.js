"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LIVE2DAUDIO;
(function (LIVE2DAUDIO) {
    var Audio = (function () {
        function Audio() {
            this._audioNames = [];
            this._volume = 0;
            this._audioCtx = new AudioContext();
            this.initCanvas();
        }
        Audio.prototype.initCanvas = function () {
            this._audioCanvas = document.getElementById("visualizer");
            this._audioCanvasCtx = this._audioCanvas.getContext("2d");
            this._audioCanvasCtx.clearRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
            this._audioCanvasCtx.fillStyle = "rgb(0, 0, 0)";
            this._audioCanvasCtx.fillRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
        };
        Audio.prototype.setAudio = function (index, audioName) {
            this._audioNames[index] = audioName;
        };
        Audio.prototype.play = function (index) {
            var _this = this;
            fetch(this._audioNames[index]).then(function (response) {
                return response.arrayBuffer();
            }).then(function (arraybuffer) {
                return _this._audioCtx.decodeAudioData(arraybuffer);
            }).then(function (buffer) {
                _this.playSound(buffer);
            });
        };
        Audio.prototype.playSound = function (buffer) {
            this._soundSource = this._audioCtx.createBufferSource();
            this._soundSource.buffer = buffer;
            this._analyser = this._audioCtx.createAnalyser();
            this._bufferLengthAlt = this._analyser.frequencyBinCount;
            this._dataArrayAlt = new Uint8Array(this._bufferLengthAlt);
            this._soundSource.connect(this._analyser);
            this._analyser.connect(this._audioCtx.destination);
            this._soundSource.start();
        };
        Audio.prototype.visuaLize = function () {
            if (this._analyser == null)
                return;
            this._analyser.getByteFrequencyData(this._dataArrayAlt);
            this._audioCanvasCtx.fillStyle = 'rgb(0, 0, 0)';
            this._audioCanvasCtx.fillRect(0, 0, this._audioCanvas.width, this._audioCanvas.height);
            var barWidth = 0;
            var barHeight = (this._audioCanvas.width / this._bufferLengthAlt) * 150.0;
            var maxValue = 0;
            for (var i = 0; i < this._bufferLengthAlt; i++) {
                barWidth = this._dataArrayAlt[i];
                maxValue = maxValue > barWidth ? maxValue : barWidth;
                this._volume = maxValue / 255;
                this._audioCanvasCtx.fillStyle = 'rgb(' + (barWidth + 100) + ',50, 50)';
                this._audioCanvasCtx.fillRect(0, 0, barWidth, barHeight);
            }
        };
        Audio.prototype.getVolume = function () {
            return this._volume;
        };
        Audio.prototype.stop = function () {
            this._soundSource.stop();
        };
        return Audio;
    }());
    LIVE2DAUDIO.Audio = Audio;
})(LIVE2DAUDIO = exports.LIVE2DAUDIO || (exports.LIVE2DAUDIO = {}));
