# PWA与跨平台解决方案研究:独立窗口模式、操作系统支持与兼容性限制

## 执行摘要与研究范围

本研究旨在为产品经理、前端/全栈工程师与平台架构负责人提供一份面向决策的技术研究与选型白皮书,系统评估渐进式 Web 应用(Progressive Web App,PWA)与其他跨平台方案(Electron、Tauri、React Native、Flutter Web、Cordova/Capacitor)在独立窗口模式、操作系统支持、兼容性与限制方面的差异,并提出可落地的技术路线与治理策略。

研究范围聚焦以下四类问题:第一,PWA 独立窗口模式的实现机制与跨平台行为差异;第二,Android、iOS/iPadOS、Windows、macOS、Linux 对 PWA 的安装与运行支持现状;第三,Electron、Tauri 等桌面框架与 PWA 在性能、包体、内存与集成能力上的真实权衡;第四,在 iOS 限制与 Android 厂商差异背景下,如何制定差异化的技术路线与分发策略。

核心结论概览如下。其一,PWA 在桌面与 Android 平台具备良好的安装与独立运行体验,WebAPK 机制使 Android 的 PWA 具备近似原生应用的集成度;但在 iOS 平台,独立窗口能力与后台特性长期受限,近期在欧洲市场的政策变化进一步增加了不确定性,需建立替代与降级方案[^2][^3][^5][^6][^11]。其二,独立窗口模式通过 Web App Manifest 的 display 成员与相关 CSS/JS 环境进行控制,standalone、fullscreen、minimal-ui、browser 四类模式在 UI 呈现、导航控制与回退策略上存在显著差异,桌面与 Android 对 standalone/minimal-ui 支持较好,而 iOS 主要回退至 standalone 行为[^7][^8][^9]。其三,Electron 与 Tauri 的取舍主要在包体与内存占用、平台 API 能力、生态成熟度与构建效率之间平衡:Electron 以完整 Chromium 运行时换取广泛能力与成熟生态,Tauri 以系统 WebView 与 Rust 后端获得显著更小的包体与更低内存,但在复杂桌面集成与构建速度上存在权衡[^13][^14][^15]。其四,选型应遵循“Web 优先、PWA 为主”的渐进增强策略:在 Android/桌面端深度集成 PWA,在 iOS 端评估原生(RN/Flutter)或混合(Cordova/Capacitor)作为增强或替代,桌面端以 Tauri 为轻量首选、Electron 为能力兜底[^1][^3][^11][^13][^14]。

研究方法基于官方文档与权威技术资料,辅以行业分析与开发者实践。MDN 与 web.dev 提供 PWA 的概念、安装与显示模式权威说明;Microsoft Learn 详述 Windows 平台对 PWA 的深度集成;行业分析与媒体报道用于补充 iOS 平台限制与政策背景;性能对比参考公开基准与社区资料,明确标注信息缺口与不确定性[^1][^2][^3][^4][^5][^6][^11][^13][^14][^15][^16]。

需要特别说明的信息缺口包括:苹果官方针对 iOS 17.4+ 在欧盟地区对 PWA 的政策变更与长期支持路线仍缺乏权威技术说明;Electron 与 Tauri 的性能基准多源于社区文章,缺乏统一测试场景与跨平台一致环境;macOS 对 PWA 的安装与运行在官方层面描述有限,主要依赖 Chrome/Edge 的桌面安装能力与第三方兼容性资料;Android 厂商(如 QuickApps)生态差异缺少系统性官方数据;PWA 与 RN/Flutter/Cordova 在复杂业务场景下的真实性能与用户转化数据仍需项目级验证[^2][^5][^6][^11][^13][^14][^16]。

## PWA基础与独立窗口模式

PWA 是一种使用 Web 平台技术构建、却提供类似特定平台应用体验的应用形态。其关键技术栈包括 Web App Manifest(用于描述应用外观与集成配置)、Service Worker(实现离线能力与后台逻辑)、Cache API(资源缓存)与 IndexedDB(结构化数据存储)。在此基础上,PWA 支持可安装性、离线运行、后台操作与设备集成等特性,从而在单一代码库上实现跨平台运行与分发[^1]。

独立窗口模式是 PWA 用户体验的关键组成部分,主要通过 Web App Manifest 的 display 成员进行声明。display 的可选值包括 browser、standalone、minimal-ui 与 fullscreen,它们决定了应用启动时是否显示浏览器 UI、是否占据全屏、以及导航控件的呈现方式。不同取值不仅影响 UI,还关联到安装后的启动行为、窗口控制与回退策略。值得注意的是,manifest 的显示模式与浏览器提供的全屏 API(Window Controls Overlay 等)是不同层面的机制,前者由 OS/浏览器在安装时决定窗口外观,后者由页面在运行时控制元素级全屏或窗口控件覆盖,二者需分别理解与测试[^7][^8][^9]。

为便于理解,下表汇总了 display 模式与典型用户体验的映射,并结合桌面与移动端的行为差异进行说明。

表 1:display 模式与用户体验映射

| 模式 | UI 特征 | 典型行为 | 跨平台支持差异 | 常见回退 |
|---|---|---|---|---|
| browser | 保留浏览器完整 UI(地址栏、标签栏等) | 常规网页浏览体验 | 通用支持,所有平台均可用 | 无 |
| standalone | 无地址栏,呈现独立应用窗口,保留系统级返回/关闭等基本控件 | 启动器入口、窗口化运行,接近原生体验 | 桌面与 Android 支持良好;iOS 强制独立显示但功能受限 | iOS 上 fullscreen/minimal-ui 通常回退为 standalone |
| minimal-ui | 保留最小 UI(如前进/后退、地址栏隐藏或简化) | 兼顾独立窗口与基本导航 | 桌面端支持较好;Android 部分支持;iOS 不支持时回退为 standalone | iOS 回退 standalone;Android 可能降级为 standalone |
| fullscreen | 全屏显示,无任何浏览器 UI | 沉浸式体验,适合媒体或游戏场景 | 桌面端支持较好;Android 支持但偶有兼容性问题;iOS 回退为 standalone | iOS 回退 standalone;Android 可能降级为 standalone 或 minimal-ui |

如表 1 所示,standalone 是多数业务应用的主选模式:它既提供了近似原生的窗口体验,又避免 fullscreen 可能带来的导航与可访问性挑战。minimal-ui 在桌面端较为实用,但在移动端支持不一致;fullscreen 虽能带来沉浸式体验,却需要谨慎处理导航与退出方式。在 iOS 平台,display 值的支持存在历史性限制,fullscreen 与 minimal-ui 往往回退为 standalone,这一点在后续平台支持章节将结合安装与运行机制进一步展开[^7][^8][^9][^2]。

### Manifest与可安装性

可安装性是 PWA 迈向“应用化”的第一步。典型条件包括提供完整的 Web App Manifest(包含名称、图标、启动 URL、显示模式等必要字段)、满足浏览器的安装触发条件(如站点活跃度与可访问性),并在 HTTPS 环境下提供服务。安装触发通常由浏览器在满足条件时提示,例如桌面端在地址栏或菜单中提供“安装”入口;开发者也可以在应用内监听 beforeinstallprompt 事件,提供自定义安装提示与交互,以提升安装转化与用户体验[^1][^2]。

### 独立窗口与显示模式详解

standalone 模式强调“窗口化运行”,强调应用作为独立实体在启动器、任务栏或搜索中可见,避免浏览器 UI 的干扰。minimal-ui 则在独立窗口的基础上保留少量导航控件,适合需要轻量导航但又希望去除地址栏的场景。fullscreen 更适合媒体、游戏或展陈类应用,强调沉浸式体验,但在移动端可能带来返回路径与系统交互的复杂性。实际选择应以业务场景与用户路径为依据:高频工具类与内容消费类应用通常优先 standalone;需要快速前进/后退的浏览类场景可考虑 minimal-ui;媒体与互动类场景在评估可访问性与退出方式后可选择 fullscreen[^7][^8][^9]。

## 操作系统级PWA支持与安装体验

不同操作系统与浏览器对 PWA 的支持存在显著差异,既体现在安装入口与运行方式,也体现在后台能力、通知、快捷方式与系统集成等方面。桌面平台(Windows、macOS、Linux、Chromebook)上的 Chrome 与 Edge 提供稳定的安装与独立窗口体验;Android 借助 WebAPK 机制实现深度集成;iOS 则以“添加到主屏幕”为主,独立运行能力与后台特性受限,且近期在欧洲市场出现政策性削弱,需要制定替代策略[^2][^3][^5][^6][^11]。

为直观呈现跨平台支持现状,下表给出功能矩阵。

表 2:跨平台 PWA 功能支持矩阵

| 平台 | 安装入口 | 运行方式 | 徽章(Badging) | 快捷方式(Shortcuts) | 通知 | 文件处理/协议处理 | 后台同步 |
|---|---|---|---|---|---|---|---|
| Windows(Chrome/Edge) | 地址栏安装图标、浏览器邀请、菜单“安装” | 独立窗口(standalone/minimal-ui) | 支持 | 支持 | 支持 | 支持(文件处理器、协议处理) | 支持 |
| macOS(Chrome/Edge) | 地址栏安装图标、浏览器邀请、菜单“安装” | 独立窗口(standalone/minimal-ui) | 支持 | 支持 | 支持 | 支持(因浏览器与系统而异) | 支持 |
| Linux(Chrome/Edge) | 地址栏安装图标、浏览器邀请、菜单“安装” | 独立窗口(standalone/minimal-ui) | 支持 | 支持 | 支持 | 支持(因发行版与浏览器而异) | 支持 |
| Android(Chrome/Samsung Internet) | 迷你信息栏、安装对话框、菜单“Install/Add to Home Screen” | WebAPK(独立应用)、回退快捷方式 | 支持 | 支持 | 支持 | 支持(系统捕获链接等) | 支持 |
| iOS/iPadOS(Safari) | 分享菜单“添加到主屏幕” | Web Clips(独立显示),功能受限 | 不支持 | 不支持 | 支持(需系统版本支持) | 有限(与书签差异小) | 有限(受系统策略约束) |

该矩阵揭示了三个关键事实:第一,桌面端与 Android 端的安装体验成熟,独立窗口与系统集成能力完善;第二,iOS 端虽然能“添加到主屏幕”,但运行方式与系统集成能力差异明显,徽章与快捷方式长期不可用,通知能力在较新系统中才得到支持;第三,Android 的 WebAPK 机制是实现原生级集成的核心,无法创建 WebAPK 时仅生成快捷方式,能力与持久性显著下降[^2][^3][^11]。

### Windows(桌面)

在 Windows 平台,Chrome 与 Edge 提供完善的 PWA 安装入口与独立窗口支持。安装后,PWA 会出现在启动器、任务栏与系统搜索中,并支持文件处理器与协议处理,这意味着关联文件类型可自动启动 PWA,用户登录时亦可配置启动,形成接近原生应用的使用体验。同时,通知、后台同步、剪贴板访问与硬件能力(如 WebBluetooth、WebUSB)也在桌面端得到较好支持,适用于工具类、内容类与协作类应用场景[^3][^2]。

### macOS(桌面)

桌面端 macOS 通过 Chrome 与 Edge 提供与 Windows 相似的安装体验与独立窗口支持。PWA 可在启动器与搜索中可见,并支持徽章与快捷方式等特性。需要注意的是,macOS 的官方文档对 PWA 的描述相对有限,实际行为依赖浏览器实现与系统版本,企业在落地前应进行版本级验证与回归测试[^2]。

### Linux(桌面)

Linux 发行版在桌面 PWA 安装与独立窗口方面的支持与 Windows/macOS 类似,主要取决于 Chrome/Edge 的实现。考虑到发行版差异与 WebView 组件的多样性,建议在目标发行版与浏览器版本上进行安装与显示模式的专项测试,以保障一致性与可访问性[^2]。

### Android

Android 的 PWA 安装体验由浏览器与设备厂商共同塑造。WebAPK 是实现深度集成的关键机制:由可信提供商(Google Play 服务或三星)签名并打包,安装后在应用启动器与设置中显示,支持徽章、快捷方式与系统链接捕获,并可更新图标与元数据。若无法创建 WebAPK,浏览器会回退到快捷方式方案,图标带有浏览器标记,且不具备持久应用入口与安装功能,无法使用徽章与快捷方式等能力。部分厂商提供 QuickApps 等轻量 Web 应用平台,体验类似快捷方式,适合低频或工具型入口,但不建议作为主方案[^11][^2]。

### iOS/iPadOS

iOS 平台通过 Safari 的分享菜单“添加到主屏幕”创建 Web Clips,安装后以独立显示模式运行,但与 Android/桌面相比,功能与持久性存在明显差距:不支持徽章与快捷方式,通知能力在较新系统版本才获得支持,后台与系统集成受限,且与浏览器中的 PWA 存在细微差异。近期在欧洲市场,苹果对 PWA 的支持出现削弱,媒体报道指出独立全屏启动与专用窗口被限制,官方解释为安全风险与用户采用率低等原因,这些变化加剧了 iOS 端的不确定性。因此,在 iOS 策略上需预设替代与降级方案,包括原生增强、混合容器或针对关键功能的原生实现[^2][^5][^6]。

## 其他跨平台解决方案对比与定位

跨平台技术路径大致分为三类:Web 内核型(Electron、Tauri)、原生 UI 型(React Native、Flutter)、混合容器型(Cordova/Capacitor)。它们在性能、包体、内存、系统集成与分发渠道上各有取舍。PWA 属于 Web 内核型的浏览器侧实现,强调跨平台与快速分发,但在 iOS 端受限;Electron 与 Tauri 面向桌面场景,提供更深的系统集成;React Native 与 Flutter 面向移动端原生体验;Cordova/Capacitor 则以 Web 技术封装原生能力,适合存量 Web 应用的轻量移动化[^1][^13][^14][^15]。

表 3:Electron vs Tauri 性能与资源对比(公开基准)

| 指标 | Tauri | Electron | 备注 |
|---|---|---|---|
| 包体大小 | 约 8.6 MiB | 约 244 MiB | Tauri 约为 Electron 的 3.5%(小 96.5%) |
| 内存占用(6 窗口) | 约 172 MB | 约 409 MB | Tauri 约为 Electron 的 42%(少 58%) |
| 启动时间 | 快速 | 快速 | 差异 < 1500ms,可忽略 |
| 构建时间(首次) | 约 380 s | 约 13 s | Tauri 受 Rust 编译影响更慢 |
| 后端语言 | Rust | Node.js | 生态与开发体验差异显著 |
| 渲染引擎 | 系统 WebView | 捆绑 Chromium | 平台差异:Windows(WebView2)、macOS(WKWebView)、Linux(WebKitGTK) |

如表 3 所示,Tauri 在包体与内存占用上显著优于 Electron,适合对安装包体积与资源敏感的场景;Electron 则凭借完整 Chromium 运行时与成熟生态,在复杂桌面能力与跨平台一致性上更具优势。构建时间方面,Tauri 首次构建较慢,需在 CI/CD 与工程效率上进行权衡。总体而言,桌面端的选型应在“轻量与能力”之间找到平衡点:轻量优先时选 Tauri,能力兜底与生态优先时选 Electron[^13][^14][^15]。

### PWA vs React Native vs Flutter Web vs Cordova/Capacitor

在移动端,PWA 的优势在于跨平台分发与快速迭代,适合轻量工具、内容消费与高频触达场景;但在通知、后台、原生集成与商店分发方面,需结合平台策略与业务需求制定差异化方案。React Native(RN)与 Flutter 提供原生 UI 与性能,适合复杂交互、硬件集成与商店生态诉求强的场景;Cordova/Capacitor 则作为混合容器,便于将存量 Web 应用快速移动化,适合预算与周期有限的项目。下表给出特性对比。

表 4:移动端跨平台特性对比

| 方案 | 安装与分发 | 离线能力 | 通知 | 原生集成 | 性能 | 维护成本 |
|---|---|---|---|---|---|---|
| PWA | 浏览器安装/添加到主屏幕;可上架部分商店 | 强(Service Worker/Cache/IndexedDB) | 桌面/Android 支持;iOS 有限 | 有限(平台差异大) | 中等(Web 渲染) | 低-中(单代码库) |
| React Native | 应用商店分发 | 强 | 强 | 强(原生模块) | 高(原生渲染) | 中-高(原生与 JS 混合) |
| Flutter Web | Web 分发为主 | 中 | 中 | 中 | 中(Web 渲染) | 中 |
| Cordova/Capacitor | 应用商店分发 | 中 | 中 | 中(插件) | 中(Web 渲染) | 中 |

该对比提示:若目标是快速覆盖与低成本迭代,PWA 是首选;若目标是高性能与深度原生集成,RN/Flutter 更合适;若需将现有 Web 应用快速移动化,Cordova/Capacitor 是务实路径。需要强调的是,RN/Flutter 的性能优势与原生集成能力伴随更高的维护成本与团队技能要求,选型时应评估团队栈与业务复杂度[^1][^16]。

## 兼容性与限制:风险清单与规避策略

跨平台方案的落地不仅取决于技术能力,更受平台政策与生态差异制约。iOS 端的 PWA 限制、Android 厂商的生态差异、桌面端显示模式与 API 的版本差异,以及 Electron/Tauri 在包体与资源上的权衡,构成了主要风险点。

表 5:平台限制与规避策略对照表

| 限制项 | 影响范围 | 风险等级 | 规避/替代方案 |
|---|---|---|---|
| iOS 独立窗口与后台受限、徽章/快捷方式不可用 | iOS/iPadOS | 高 | 关键功能原生化(RN/Flutter);混合容器(Cordova/Capacitor)承载 Web 内容;针对通知与后台策略进行原生增强 |
| iOS 欧洲政策变化导致 PWA 能力削弱 | 欧盟 iOS | 高 | 建立区域化策略:原生替代、渐进式降级、用户引导与沟通;监测官方技术说明并快速迭代[^5][^6] |
| Android 厂商差异(WebAPK vs 快捷方式 vs QuickApps) | Android 设备 | 中 | 优先 WebAPK;无法 WebAPK 时以快捷方式回退;避免依赖厂商特定平台作为主分发渠道[^11][^2] |
| 桌面显示模式与 API 兼容差异 | Windows/macOS/Linux | 中 | 以 standalone 为主;minimal-ui 与 fullscreen 谨慎采用;建立版本级回归测试与降级路径[^7][^8][^9] |
| Electron 包体与内存占用高 | 桌面端 | 中 | 轻量场景优先 Tauri;复杂桌面能力与生态需求时选 Electron;优化资源与进程模型[^13][^14][^15] |
| Tauri 首次构建时间与平台 WebView 差异 | 桌面端 | 中 | 优化 CI/CD;在目标平台进行 WebView 兼容性测试;必要时以 Electron 兜底[^13][^14] |

该风险清单表明:高风险主要集中在 iOS 端,需提前准备原生替代与混合容器策略;中风险主要来自平台差异与工程权衡,需通过版本级测试与工程优化进行缓解[^5][^6][^11][^7][^8][^9][^13][^14]。

## 选型建议与技术路线图

选型应遵循“Web 优先、PWA 为主、桌面轻量优先、平台能力兜底”的原则,结合业务场景、团队栈与分发策略制定差异化路线。

- 移动端:Android/桌面优先采用 PWA,利用 WebAPK 与独立窗口获得原生级体验;iOS 端以 PWA 轻量覆盖为基础,对关键功能或高交互模块采用 React Native/Flutter 增强;存量 Web 应用可引入 Cordova/Capacitor 作为过渡。
- 桌面端:以 Tauri 为轻量首选,在包体与内存占用上显著优于 Electron;当遇到复杂桌面集成需求或生态依赖时,以 Electron 兜底,确保能力与稳定性。
- 分发策略:桌面与 Android 优先 Web 安装与商店上架;Windows 可提交至 Microsoft Store;iOS 视政策与业务诉求评估原生上架与混合容器方案。
- 实施路径:以 PWA 渐进增强为主线,针对 iOS 限制与 Android 厂商差异制定替代与降级方案,并建立版本级测试与回归机制。

表 6:场景-方案选型矩阵

| 场景 | 推荐方案 | 主要理由 | 风险与对策 |
|---|---|---|---|
| 高频工具类(跨平台) | PWA(Android/桌面)+ RN/Flutter(iOS 增强) | 快速分发与离线能力;在 iOS 用原生增强关键功能 | iOS 限制:原生增强与混合容器兜底;版本级回归测试 |
| 内容消费/媒体 | PWA(standalone/fullscreen)+ 桌面 Tauri | 窗口化沉浸体验;轻量包体与低内存占用 | fullscreen 可访问性与退出路径;平台显示模式降级预案 |
| 电商/交易 | PWA(Android/桌面)+ RN/Flutter(iOS) | 安装便捷与离线能力;复杂交互与通知需要原生支持 | iOS 通知与后台策略评估;商店合规与安全要求 |
| 桌面协作/开发工具 | Tauri(轻量)+ Electron(能力兜底) | 轻量优先,复杂集成与生态依赖时 Electron 兜底 | 构建时间与平台 WebView 差异;CI/CD 优化与兼容性测试 |
| 存量 Web 应用移动化 | Cordova/Capacitor(过渡)+ PWA | 快速封装与上线;逐步迁移至 PWA 或原生 | 插件兼容性与性能;长期维护成本评估 |

该路线强调以 PWA 为统一 Web 能力底座,辅以平台特性与原生增强,既保证跨平台一致性与交付效率,又在 iOS 等受限平台保留体验与能力的底线[^1][^3][^11][^13][^14]。

## 实施要点与最佳实践

- Manifest 配置:name、icons、start_url、display、theme_color、background_color 等字段需完整配置,确保可安装性与窗口体验。display 建议以 standalone 为主,minimal-ui 与 fullscreen 谨慎采用,并建立回退策略[^7][^8]。
- 安装体验:监听 beforeinstallprompt 事件,提供自定义安装入口与提示文案;在桌面端结合地址栏与菜单安装入口进行引导;在 Android 优先 WebAPK,无法 WebAPK 时以快捷方式回退并明确告知用户差异[^2][^11]。
- 离线与缓存:使用 Service Worker、Cache API 与 IndexedDB 构建分层缓存与离线能力;针对关键资源采用预缓存,动态内容使用网络优先或缓存优先策略,保障性能与一致性[^1]。
- 桌面增强:在 Windows 平台启用文件处理器与协议处理,集成剪贴板、通知与后台同步;针对硬件能力(如 WebBluetooth、WebUSB)进行特性检测与降级处理,确保安全与兼容[^3]。
- 版本与测试:建立 OS/浏览器版本级测试矩阵,覆盖 display 模式、安装流程、WebAPK/快捷方式差异与回退路径;对 iOS 区域政策变化进行监测与快速响应,预留原生替代与混合容器方案[^2][^5][^6][^11]。

## 结论与后续工作

综合来看,PWA 在桌面与 Android 平台已具备成熟且深度的支持,WebAPK 与独立窗口机制使其在安装体验、系统集成与离线能力上接近原生应用;在 iOS 平台,PWA 仍可作为轻量覆盖与触达手段,但独立窗口与后台能力的限制以及欧洲市场的政策变化增加了不确定性,需要以原生或混合方案进行增强或替代。跨平台桌面方案方面,Tauri 在包体与内存占用上显著优于 Electron,适合轻量与资源敏感场景;Electron 凭借完整 Chromium 与成熟生态,在复杂桌面能力与一致性上更具优势[^2][^3][^5][^6][^11][^13][^14]。

建议方面,企业应坚持“Web 优先、PWA 为主、平台能力兜底”的策略:在 Android/桌面端深度集成 PWA,在 iOS 端评估原生(RN/Flutter)或混合(Cordova/Capacitor)作为增强与替代;桌面端以 Tauri 为轻量首选,Electron 为能力兜底。分发与治理层面,应建立版本级测试矩阵、区域化策略与政策监测机制,确保在平台变化中保持体验与能力的稳定[^1][^3][^11][^13][^14]。

后续工作包括:持续监测苹果官方针对 iOS 17.4+ 的技术说明与政策更新;在目标设备与浏览器版本上开展性能与兼容性实测,形成项目级数据与经验;完善商店分发与合规策略,评估 PWA 上架 Microsoft Store 与 Google Play 的可行性与收益,确保技术与业务的双重最优[^2][^3][^11]。

---

## 参考文献

[^1]: 渐进式 Web 应用(PWA) | MDN. https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps  
[^2]: 安装 | web.dev for China(PWA 安装指南). https://web.developers.google.cn/learn/pwa/installation?hl=zh-cn  
[^3]: 渐进式 Web 应用(PWA)概述 - Microsoft Edge Developer. https://learn.microsoft.com/zh-cn/microsoft-edge/progressive-web-apps/  
[^4]: Progressive Web Apps Compatibility - firt.dev. https://firt.dev/notes/pwa/  
[^5]: 苹果扼杀 PWA?iOS 上的 PWA 体验难达标,原生应用... | InfoQ. https://www.infoq.cn/article/R9AZAYSQ3vhWuc4sj9Cg  
[^6]: 苹果解释欧洲新规削弱 PWA 应用原因:安全风险大、用户... | IT之家. https://www.ithome.com/0/750/443.htm  
[^7]: display - Web app manifest | MDN. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/display  
[^8]: 显示 - Web 应用清单 | MDN(中文镜像). https://mdn.org.cn/en-US/docs/Web/Manifest/display  
[^9]: Web App Manifest Display Modes – What is the Difference? | SuperPWA. https://superpwa.com/docs/article/web-app-manifest-display-modes-what-is-the-difference/  
[^10]: PWA遇到的一些问题。PWA的manifest中display设置的显示模式区别 | CSDN. https://blog.csdn.net/weixin_39550080/article/details/141124643  
[^11]: Android上的WebAPK | web.dev for China. https://web.developers.google.cn/articles/webapks  
[^12]: 将您的PWA提交到Microsoft Store | Microsoft Docs. https://docs.microsoft.com/en-us/windows/uwp/publish/pwa/overview  
[^13]: Tauri 与 Electron 对比:性能、包大小及实际权衡 | 技术栈. https://jishuzhan.net/article/1911271892192919553  
[^14]: Tauri vs. Electron:性能、体积与真实权衡 | 21CTO. https://www.21cto.com/article/8609230283191068  
[^15]: Tauri vs Electron: The Ultimate Desktop Framework Comparison | Peerlist. https://peerlist.io/jagss/articles/tauri-vs-electron-a-deep-technical-comparison  
[^16]: 揭秘PWA与React Native:如何选择移动应用开发的未来之星? | oryoy.com. https://www.oryoy.com/news/jie-mi-pwa-yu-react-native-ru-he-xuan-ze-yi-dong-ying-yong-kai-fa-de-wei-lai-zhi-xing.html