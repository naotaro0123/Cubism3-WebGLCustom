# Cubism WebGL SDK3.0でリップシンク
Cubism WebGL SDK(https://github.com/Live2D/CubismJsComponents)を元にWebAudioでリップシンクさせたサンプルです。


## 使い方

npm install後、src配下のtsconfig.jsonとexample/src配下のtsconfig.jsonをビルドします。
example/wwwroot配下に出力されるので、index.htmlを実行すると以下の機能が使えます。

- 音声からのリップシンク or マイク入力からのリップシンク
- 合成音声に合わせて発話とリップシンク
- 別CanvasにLive2Dモデルを描画
- マウスドラッグによる視線追従
- モーション切り替え
- モーションスピード調整
- Canvasの透明度調整
- Live2Dモデルの位置と拡大縮小

![LipSync](https://github.com/naotaro0123/Cubism3_WebGL_Custom/images/LipSync.gif)

![MouseTracking](https://github.com/naotaro0123/Cubism3_WebGL_Custom/images/MouseTracking.gif)
