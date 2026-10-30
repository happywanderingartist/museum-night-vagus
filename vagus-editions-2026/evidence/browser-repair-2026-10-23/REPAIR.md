# Chrome 控制会话恢复记录

日期：2026-10-23。任务：修复本项目Chrome连接，不改网站或浏览器安全设置。

已知事实：首次枚举返回Codex app tool request failed。重建控制运行会话后发现两个Chrome扩展实例；用户打开Shopify的实例为e96e9b59-c7f4-4053-82d2-a1ebb1b995da，另一个实例954f9ed1-b9c1-4b8b-86af-9ba3afd3eb73没有可见标签。短数字浏览器ID在控制会话重置后发生变化，不能跨重置沿用其含义。

旧用户标签43209302的页面内容读取成功；点击Sidekick的组合调用超时，重置后URL已变为#sidekick，说明动作实际执行。后续截图连续返回Debugger unattached；重新claim旧标签也未恢复截图。因此旧标签仍有异常，未报告彻底修复。

恢复方式：保持同一个有页面的Chrome扩展实例，使用其公开接口新建受控标签43209314，再分开执行导航、截图、语义点击、截图。新标签各步骤均成功，未改底层浏览器代码、注册表、扩展权限、缓存或用户资料。

验证证据：新标签导航到Shopify Winter2026，chrome-shopify-hero.png为实际浏览器截图；点击可见Sidekick链接后URL为https://www.shopify.com/editions/winter2026#sidekick，chrome-shopify-sidekick.png再次实际截图，能看到Sidekick章节。新标签已保留，用户旧标签未关闭。

结论：本次Chrome受控会话已恢复可用，读取/导航/点击/点击后截图均有证据。不能据此证明永久消除调试会话丢失或上游超时故障，也未验证本地Vagus网页。下次优先复用已保留的新标签；若运行会话重新初始化，应按扩展实例与当前标签识别Chrome，不硬编码历史数字浏览器ID。
