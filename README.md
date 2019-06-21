# ColorPicker

...


## 备忘

实际上有些包是不需要被编译打包的，如 electron、react、react-dom，到时候在 html 中直接引用 lib.min.js

编译过程移除的问题后续考虑


## 遇到的问题

getClipData 卡了好久，奇怪为什么超过一定数值，data[xxx] 获取到的 r g b a 都是 0

实际上是一开始 tmpCanvas 没有设置 width, height

导致了 getScreenSources 的 callback 中 tmpContext.drawImage 绘制内容完全溢出了
