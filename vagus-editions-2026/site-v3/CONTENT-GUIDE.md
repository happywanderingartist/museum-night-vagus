# 真实内容接入

编辑assets/site-content.json。保留真实、可公开的材料；不需要上传至任何外部服务。相对路径从网站根目录解析。材料加入public/后重启本机服务不是必须，新增文件在下次读取时可见。修改服务器程序本身才需要重启。

## 简历与联系

resume.url可填public/resume.pdf或确认可公开的HTTPS链接；填写后简历入口指向原始文件。contact.email填公开邮箱，页面只生成mailto链接，不自动发送消息。教育、经历、职责和成果应在scripts/build-pages.cjs中按真实材料补充，当前没有代填。

## 文章

articles对应已提供的seed、vibe、selection三个主题。为url填写真实原文链接即可显示阅读入口；未提供的内容不补写正文或数量。需要新增文章时先补真实标题与原文，再在生成器中增加阅读行。

## 音频

将MP3、M4A、WAV或OGG放入public/，audio.src填写其路径；audio.title填写实际节目或单集名称。真实音频出现后用原生audio控件播放/暂停/调节进度和音量，不自动开始。文件错误会保留文字内容。播放器实际表现和真实录音播放仍待浏览器验收。

## 个人作品

将高清WebP、PNG或JPEG放入public/，在personalWorks加入对象：

~~~json
{
  "title": "实际作品名称",
  "src": "public/poster.webp",
  "alt": "画面内容的文字描述",
  "caption": "实际用途、本人工作与必要说明"
}
~~~

文件接入后会进入个人作品画廊，和本网站AI艺术试稿分组翻阅；文字以纯文本插入。不要把示例路径或未提供的内容当成现成作品。当前personalWorks为空。

## 本机文件范围

public/仅服务PDF、MP3、M4A、WAV、OGG、WebP、PNG、JPEG。不把账号、密钥、聊天历史或私有材料放进去；构建源码与sources目录不通过预览服务器提供。
