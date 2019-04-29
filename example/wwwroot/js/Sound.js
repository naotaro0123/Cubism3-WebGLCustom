'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var LIVE2DSOUND;
(function(LIVE2DSOUND) {
  var Sound = (function() {
    function Sound(snd) {
      this._snd = snd;
    }
    Sound.prototype.play = function() {
      this._snd.play();
    };
    Sound.prototype.stop = function() {
      this._snd.pause();
      this._snd.currentTime = 0;
    };
    Sound.prototype.volume = function() {
      return this._snd.volume;
    };
    return Sound;
  })();
  LIVE2DSOUND.Sound = Sound;
})((LIVE2DSOUND = exports.LIVE2DSOUND || (exports.LIVE2DSOUND = {})));
