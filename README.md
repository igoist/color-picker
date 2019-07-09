# ColorPicker

...


## 备忘

实际上有些包是不需要被编译打包的，如 electron、react、react-dom，到时候在 html 中直接引用 lib.min.js

编译过程移除的问题后续考虑

* ipc 几个事件
* build 事项


## 遇到的问题

getClipData 卡了好久，奇怪为什么超过一定数值，data[xxx] 获取到的 r g b a 都是 0

实际上是一开始 tmpCanvas 没有设置 width, height

导致了 getScreenSources 的 callback 中 tmpContext.drawImage 绘制内容完全溢出了




### ipc 几个事件

1. clip-view-send-value & repeating-clip-view-value

App 中 ClipView 点击取色后，为了更新 ColorMenu 中色值状态，发送 clip-view-send-value 到 main(index.js)，再由 main 中继转发，以 repeating-clip-view-value 发送到 ColorMenu


2. color-picker-prepare-exit & color-picker-exit

原先 Esc 绑定事件直接关闭窗口，现改为先由 main 发送 color-picker-prepare-exit 到 ColorMenu，再由 ColorMenu 通过 color-picker-exit 返回 tmpHistoryArr 至 main, 并在 main 中保存取色 历史


3. color-picker-init-complete & color-picker-update-history

ColorMenu 中利用 useEffect 进行的初始化最后一步，发送 color-picker-init-complete 至 main，由 main 中尝试读取本地 history 文件，若能读取到，则由 main 通过 color-picker-update-history 返回 history


### build 注意事项

目前，需要手动调整 index.js 中 win 指定 index.html

webpack.prod.js 中 publicPath 需要指定为 './'
