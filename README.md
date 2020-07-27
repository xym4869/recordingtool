# recordingtool

## Version1:
功能：实现两个录音按钮，录音文件列表展示，打包下载。
两个主文件夹
- src：react+tsx；
- srcts：（从 [download JSZip](http://github.com/Stuk/jszip/zipball/master) 下载包解压后放入该文件夹中，并该名为Stuk-jszip）
  - index.html：+record.js（由record.ts转换而成）
  - index2.html：+recorder.js

## Version2

功能：选择txt文件上传，选择txt文件读取内容，形成列表，选取sentence进行录音。录音完成后可打包下载录音文件。

修改至：src

## Version3

修改至：src

删除antd，将react改成hook，并添加fileList与sentenceList的互动（修改sentenceList会同步到fileList中）

update：不再使用blob存储录音内容，改用src存储后，需要下载时获取blob再下载。