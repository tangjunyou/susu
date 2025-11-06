# 浏览器扩展实现跨软件置顶的技术研究与方案评估

## 摘要与结论先行(Executive Summary)

跨软件“置顶”需求指在浏览器之外的任意应用程序之上持续保持一个悬浮层,并在失焦、锁屏、任务切换等场景下仍尽可能可见。这一诉求在多任务办公、直播辅助、在线教育与客服等场景尤为常见。围绕浏览器扩展(Extension)生态,最直接的两条技术路径是使用扩展的弹出式悬浮窗(popup)与通过内容脚本在页面中注入悬浮层;此外,Chrome系的Document Picture-in-Picture(PiP)与独立应用/系统工具配合扩展的混合方案在“跨软件置顶”方面提供了更现实的可行性。

综合官方文档与社区资料,核心结论如下:

- popup在失焦时关闭是浏览器设计的一致行为,无法通过常规API保持显示;因此仅凭popup无法实现跨软件置顶[^1][^2][^3]。
- 内容脚本注入的悬浮层仅在浏览器标签页内可见,无法跨出浏览器边界到其他应用之上。
- Chrome系的Document PiP可生成独立悬浮窗口,具备跨软件置顶的潜力,但其可用性与行为在不同平台版本上存在差异,需按目标环境验证[^9][^10][^11][^12]。
- 系统层“置顶”能力与浏览器扩展分属不同权限域,必须通过独立应用或系统工具(如Windows的PowerToys Always On Top)实现,扩展可与这类工具协同(例如快捷键触发)[^13]。
- 推荐路线:优先采用Document PiP(Chrome/Edge)并针对平台差异提供降级;在Safari与Firefox上采用混合方案(独立应用或系统工具)实现跨软件置顶;严格控制权限与隐私,遵循Manifest V3(MV3)与Safari Web Extensions的权限模型[^4][^5][^6][^7][^8]。

为直观呈现各路线的适用性,下表总结“路线—能力—约束—适用平台”的对比。

表1 路线—能力—约束—适用平台对比表

| 路线 | 跨软件置顶能力 | 失焦保持 | 主要约束 | 适用平台/浏览器 |
|---|---|---|---|---|
| popup(扩展) | 无 | 失焦即关闭 | 生命周期短、不可程序化打开、窗口管理受限 | Chrome、Firefox、Edge、Safari(表现一致)[^1][^2][^3] |
| 内容脚本注入 | 无 | 随页面存在 | 仅在网页内可见,无法越界到其他应用 | 所有主流浏览器 |
| Document PiP(Chrome/Edge) | 有 | 具备窗口态,可保持 | 平台版本与实现差异;用户授权与交互要求 | Chrome/Edge(需按版本验证)[^9][^10][^11][^12] |
| 混合方案(扩展+独立应用) | 有 | 由系统工具保证 | 需安装额外工具/应用;权限与隐私治理 | Windows/macOS(配合PowerToys等)[^13] |

从实施角度看,若目标仅限Chrome/Edge,Document PiP是首选;若需覆盖Firefox与Safari,混合方案更稳妥;popup与页面注入仅适合浏览器内的短时交互或页面伴随式悬浮。

## 研究范围与方法

本研究聚焦桌面端主流浏览器:Chrome(含Chromium系,如Edge)、Firefox与Safari(macOS)。围绕四条技术路线(popup、内容脚本注入、Document PiP、混合方案)展开,评估其跨软件置顶能力、失焦保持、权限与安全约束,以及在多平台上的实现复杂度与用户体验。

方法上,以官方文档与权威技术资料为主,辅以社区讨论与开源案例。核心参考包括Chrome扩展action API与popup设计原则、Firefox WebExtensions的popup行为、Safari Web Extensions的权限模型,以及MV3对安全与权限的影响等[^4][^5][^6][^7][^8]。同时,结合Document PiP的开源实现与扩展案例,验证跨软件置顶的可行性与边界[^9][^10][^11][^12]。

需要明确的信息缺口包括:Safari是否提供与Document PiP等价能力的官方说明;Chrome Document PiP在macOS上的行为与Windows/Linux的一致性细节;Firefox对Document PiP或“独立悬浮窗口”的支持状态;不同平台下失焦/锁屏/屏幕保护对各方案可见性的定量影响。这些需在目标环境通过实测补充。

## 背景与概念界定:跨软件置顶与扩展悬浮窗机制

跨软件置顶指在操作系统层面的多窗口环境中,使指定悬浮层始终位于其他应用窗口之上,并在用户切换任务、打开其他应用时仍保持可见。这与浏览器扩展生态中的“悬浮窗”概念不同:扩展的popup是点击工具栏按钮后弹出的临时交互窗口,内容脚本注入的悬浮层则依附于网页的DOM与渲染树,二者的可见性与窗口管理均受浏览器约束。

Document Picture-in-Picture(以下简称“Document PiP”)是浏览器在窗口管理上提供的一种特殊能力:在Chrome/Edge中,网页可以通过PiP API创建独立于标签页的悬浮窗口,该窗口具备独立的窗口态与Z序( stacking order),因此在跨软件置顶场景中表现出更好的适配性[^9][^10][^11][^12]。但其实现细节与授权流程仍需遵循浏览器的用户交互与安全模型。

为帮助理解popup的交互形态,下面展示官方示意图。

![Chrome扩展popup UI示意(来自官方文档)](assets/images/chrome_add_popup.png)

图1展示的是扩展点击后弹出的popup界面,这类UI适合短时交互与轻量信息展示,但并不适合持久显示或跨软件置顶[^4]。

## 浏览器悬浮窗机制与失焦行为

popup机制在各大浏览器中的表现具有高度一致性:popup通常与工具栏按钮或地址栏按钮关联,用户点击时显示,点击外部区域即自动关闭;popup文档在每次显示时加载、关闭时卸载,生命周期短且不可程序化打开(需用户手势触发),失焦即关闭[^1][^2][^3]。这一机制的核心考量是安全与用户体验,避免扩展随意保持窗口从而干扰浏览或侵犯用户隐私。

内容脚本注入的悬浮层则完全受所在页面的生命周期与可见性约束,仅在浏览器标签页内可见,无法跨出浏览器窗口到其他应用之上,因而无法实现跨软件置顶。

Document PiP在Chrome/Edge中创建独立悬浮窗口,具备窗口态与Z序管理能力,因此在跨软件置顶方面具备潜力。但其具体行为在不同平台版本存在差异,需要针对目标环境进行验证与适配[^9][^10][^11][^12]。

表2 失焦行为对比表

| 方案 | 失焦时表现 | 可见范围 | 跨软件置顶可行性 | 备注 |
|---|---|---|---|---|
| popup | 失焦即关闭 | 浏览器工具栏附近 | 不可行 | 生命周期短,需用户手势触发[^1][^2][^3] |
| 内容脚本注入 | 随页面存在 | 仅网页内 | 不可行 | 依附DOM,无法越界 |
| Document PiP | 保持窗口态 | 独立窗口,可置顶 | 可行(因平台差异需验证) | Chrome/Edge支持,授权与交互要求[^9][^10][^11][^12] |

### popup机制与限制

popup的触发通常来自工具栏按钮或地址栏按钮,也可通过快捷键或扩展API的受控方式打开(例如Chrome的openPopup需满足用户手势与权限条件)。其生命周期遵循“显示即加载、关闭即卸载”,适合短时交互与轻量任务;对于持久显示或跨软件置顶需求,popup并不适配[^1][^4][^5]。

### 内容脚本注入悬浮层

通过内容脚本在页面DOM中注入悬浮层,可以实现伴随页面的悬浮UI,但其可见性受限于所在标签页,无法在其他应用之上显示。因此,内容脚本注入更适合页面伴随式信息展示或浏览器内工具,而非跨软件置顶。

### Document PiP(Chrome/Edge)

Document PiP允许将网页内容放入独立悬浮窗口,具备窗口态与Z序,满足跨软件置顶的核心诉求。开源实现与扩展案例显示,这一能力能够把网页转换为“始终置顶的浮动窗口”,在多任务场景中保持可见[^9][^10][^11][^12]。但需注意平台版本差异与用户授权流程,确保在目标环境下的行为一致。

## 主流浏览器扩展API能力对比(Chrome/Firefox/Edge/Safari)

跨浏览器实现的关键在于理解各平台的权限模型、API入口与限制。Chrome与Edge基于Chromium,Firefox遵循WebExtensions模型,Safari采用Safari Web Extensions并通过Swift/Objective‑C实现原生层桥接。

表3 API能力对比表

| 能力维度 | Chrome(MV3) | Firefox(WebExtensions) | Edge(Chromium) | Safari(Web Extensions) |
|---|---|---|---|---|
| popup支持 | action API,支持openPopup(需用户手势)[^4][^5] | browser_action与action.openPopup(受用户手势限制)[^1][^3] | 同Chrome(基于Chromium) | 无等价popup;通过Swift/Objective‑C实现原生UI[^6][^7][^8] |
| 窗口管理 | 标签页/窗口管理API,popup生命周期短 | 标签页/窗口管理API,poup行为明确[^1][^2] | 同Chrome | 需通过原生层扩展实现窗口控制[^6][^7][^8] |
| 权限与安全 | MV3权限收敛、host权限控制、隐私与安全限制增强[^5] | 权限模型清晰,用户控制优先[^1][^2] | 同Chrome | 严格权限与用户同意,隐私期望高[^6][^8] |
| 跨平台一致性 | 高(Chromium系) | 中(细节差异) | 高(Chromium系) | 低(需原生层适配) |

### Chrome(MV3)

Chrome的action API提供工具栏图标与popup控制。popup通过manifest或API设置,openPopup需满足用户手势与权限条件,失焦自动关闭。MV3在权限与安全方面更加严格,对后台脚本与主机权限进行收敛,提升隐私与安全基线[^4][^5]。

### Firefox(WebExtensions)

Firefox的browser_action与popup机制与Chromium系类似,poup失焦即关闭,窗口管理与API行为明确。action.openPopup受用户手势限制,确保扩展不随意弹出窗口[^1][^2][^3]。

### Edge(Chromium)

Edge基于Chromium,popup与窗口管理能力与Chrome一致,Document PiP表现相近;在扩展商店发布与权限声明上遵循Chromium生态规则[^9][^10][^11][^12]。

### Safari(Web Extensions)

Safari的Web Extensions以JavaScript/HTML/CSS为主,但窗口管理与UI需通过原生层(Swift/Objective‑C)实现,权限与用户同意更为严格。Safari用户对隐私与安全的期望较高,需谨慎请求权限并提供透明的说明[^6][^7][^8]。

## 跨软件置顶方案设计与技术路径

围绕“跨软件置顶”的核心目标,提出四条路径,并从能力、约束、复杂度与用户体验进行评估。

表4 方案能力矩阵

| 方案 | 跨软件置顶 | 失焦保持 | 权限/安全约束 | 实现复杂度 | 适用平台 |
|---|---|---|---|---|---|
| A:仅popup | 不支持 | 失焦即关闭 | 低(常规popup权限) | 低 | 全平台,但能力受限[^1][^2][^3] |
| B:内容脚本注入 | 不支持 | 随页面存在 | 中(需注入与样式控制) | 低 | 全平台,但仅页面内可见 |
| C:Document PiP | 支持 | 保持窗口态 | 中(用户授权与手势) | 中 | Chrome/Edge(需版本验证)[^9][^10][^11][^12] |
| D:混合方案 | 支持 | 由系统工具保证 | 中高(需安装工具与权限治理) | 中高 | 全平台(Windows/macOS)[^13] |

### 方案A:仅popup(不推荐)

优势在于实现简单、权限要求低;但popup失焦即关闭,无法跨软件置顶。仅适用于浏览器内的短时交互与轻量信息展示[^1][^2][^3]。

### 方案B:内容脚本注入(不推荐用于跨软件置顶)

可在页面内实现悬浮层与交互,但无法跨出浏览器窗口到其他应用之上,跨软件置顶不可行。适合伴随页面的工具型UI。

### 方案C:Document PiP(Chrome/Edge首选)

通过PiP创建独立悬浮窗口,具备跨软件置顶潜力。需验证不同平台版本的可用性与授权流程,结合开源实现与扩展案例进行适配[^9][^10][^11][^12]。

### 方案D:混合方案(扩展+独立应用/系统工具)

扩展负责入口与交互,系统工具或独立应用负责跨软件置顶。例如在Windows上可使用PowerToys Always On Top将任意窗口置顶,扩展通过快捷键或消息桥接触发该能力[^13]。此方案覆盖Firefox与Safari更稳妥,但需处理安装依赖与权限治理。

## 方案C详解:Document PiP实现要点(Chrome/Edge)

Document PiP的核心在于将网页内容放入独立悬浮窗口,使其具备窗口态与Z序,从而在多任务环境下保持可见。实现要点包括:

- 入口与触发:遵循用户手势与授权流程,确保在合规前提下打开PiP窗口[^9][^10]。
- 窗口管理与置顶:PiP窗口具备独立窗口态,可与其他应用窗口竞争Z序;在不同平台上可能存在置顶策略与焦点行为的差异,需通过实测优化用户体验[^9][^10][^11][^12]。
- 用户体验与权限:清晰提示PiP窗口的用途与可见范围,避免与恶意弹窗混淆;提供关闭与最小化等控制,降低干扰。
- 平台差异与降级:在不支持或行为不一致的环境中,提供降级到方案D的路径。

表5 Document PiP平台支持与行为差异表(需实测填充)

| 平台 | 支持状态 | 置顶表现 | 失焦保持 | 备注 |
|---|---|---|---|---|
| Windows(Chrome/Edge) | 支持 | 稳定置顶(需版本验证) | 保持 | 结合开源实现与扩展案例验证[^9][^10][^11][^12] |
| macOS(Chrome/Edge) | 支持(版本相关) | 依系统窗口管理策略 | 保持 | 需验证焦点与Mission Control行为 |
| Linux(Chrome/Edge) | 支持(发行版相关) | 桌面环境差异影响 | 保持 | 需针对主流桌面环境测试 |

## 方案D详解:混合方案(扩展+独立应用/系统工具)

混合方案通过扩展与系统工具协同实现跨软件置顶:

- 触发方式:扩展监听快捷键或菜单操作,通过本地协议、消息桥接或URL Scheme等方式通知独立应用执行置顶[^13]。
- 置顶对象:系统工具可对任意窗口置顶,包括浏览器窗口或特定应用窗口;扩展负责选择目标并下发指令。
- 权限与安全:系统工具需获得窗口管理权限;扩展需最小权限原则,避免过度请求主机权限或敏感API。
- 用户体验:在不支持PiP的平台或用户不愿安装额外工具时,提供清晰说明与替代路径。

表6 混合方案组件与交互表

| 组件 | 职责 | 交互事件 | 错误处理 |
|---|---|---|---|
| 扩展(前端) | 接收用户操作、发起置顶请求 | 快捷键、菜单点击 | 提示未安装工具或权限不足 |
| 桥接层 | 消息传递与协议适配 | 本地消息、URL Scheme | 重试与回退机制 |
| 系统工具/独立应用 | 执行窗口置顶 | 接收指令并操作窗口 | 记录日志并提示失败原因 |

## 安全性、权限与合规

MV3对权限与安全提出更严格要求,包括权限收敛、主机权限控制与更严格的内容安全策略(CSP)。这有助于降低扩展滥用风险,但也要求开发者在设计与实现上遵循最小权限原则[^5]。Safari Web Extensions强调用户同意与隐私保护,权限请求需透明、范围明确,并提供可撤销机制[^6][^8]。从安全研究角度看,浏览器扩展生态中存在恶意扩展、策略违规与漏洞等风险,开发者应参考最新研究与统计,建立权限审计与发布流程规范[^14][^15][^16]。

表7 权限—能力映射表

| 权限 | 能力 | 风险 | 缓解策略 |
|---|---|---|---|
| host权限(主机) | 访问指定站点内容 | 过度采集、滥用脚本 | 最小范围、明确用途、用户告知[^5] |
| activeTab | 临时访问当前标签页 | 临时性数据访问 | 仅在用户操作时请求,避免持久化[^5] |
| 窗口管理(系统工具) | 跨软件置顶 | 干扰其他应用、隐私风险 | 明确授权、可撤销、审计日志[^13] |
| 原生桥接(Safari) | 与原生层交互 | 权限扩大 | 分层权限设计、用户同意与控制[^6][^8] |

## 性能、维护与跨浏览器兼容性

跨浏览器实现的性能与维护成本主要来自平台差异与API不一致。Chromium系(Chrome/Edge)在popup与窗口管理方面一致性较高;Firefox遵循WebExtensions模型,细节行为需适配;Safari需原生层支持,窗口管理与UI的实现路径不同[^7][^6][^8]。在维护上,建议抽象UI层与平台适配层,采用特性检测与Polyfill策略,并建立自动化测试矩阵覆盖多平台关键路径。

表8 兼容性矩阵(API与UI路径)

| 能力 | Chrome | Edge | Firefox | Safari |
|---|---|---|---|---|
| popup | 支持(action API) | 支持(Chromium) | 支持(WebExtensions) | 无等价popup(需原生层)[^4][^1][^6][^7][^8] |
| Document PiP | 支持 | 支持 | 不支持(需验证) | 无官方等价(需验证)[^9][^10][^11][^12] |
| 窗口管理 | 标签页/窗口API | 同Chrome | WebExtensions API | 原生层实现[^6][^7][^8] |

## 实施路线图与里程碑

为确保落地可控,建议按以下阶段推进:

- 阶段1:Chrome/Edge的Document PiP原型。目标是验证跨软件置顶能力、授权流程与用户体验,并建立版本差异清单[^9][^10][^11][^12]。
- 阶段2:Firefox与Safari的混合方案适配。实现扩展与系统工具的桥接,覆盖目标平台并完成权限与隐私评审[^6][^8][^13]。
- 阶段3:安全与隐私评审、商店发布准备。依据MV3与Safari权限模型完善权限最小化、隐私说明与审计机制[^5][^6][^8]。
- 阶段4:用户测试与迭代。收集失焦、锁屏、任务切换等场景的反馈,优化置顶策略与提示。

表9 里程碑与交付物表

| 阶段 | 目标 | 交付物 | 验收标准 | 风险与缓解 |
|---|---|---|---|---|
| 1 | PiP原型 | 原型扩展、差异清单 | 跨软件置顶可用 | 版本差异→降级方案 |
| 2 | 混合方案 | 扩展+工具桥接 | 多平台覆盖 | 安装依赖→引导与校验 |
| 3 | 合规发布 | 权限审计、隐私说明 | 商店审核通过 | 权限收紧→最小化 |
| 4 | 用户迭代 | 测试报告、优化方案 | 关键场景稳定 | 体验问题→交互优化 |

## 风险清单与应对策略

跨软件置顶方案面临能力边界、平台差异与用户体验等风险,需建立明确缓解措施。

表10 风险—影响—缓解表

| 风险 | 影响 | 缓解策略 |
|---|---|---|
| popup失焦关闭 | 无法跨软件置顶 | 采用Document PiP或混合方案[^1][^2][^3] |
| Document PiP平台差异 | 行为不一致、授权失败 | 版本验证、降级到系统工具[^9][^10][^11][^12] |
| Safari权限与审核 | 发布受限 | 最小权限、透明说明、原生层适配[^6][^8] |
| 用户体验与焦点干扰 | 投诉与卸载 | 明确提示、可撤销、交互优化[^13] |

## 结论与后续工作

最终推荐方案是:在Chrome/Edge上优先使用Document PiP实现跨软件置顶;在Firefox与Safari上采用混合方案(扩展+独立应用/系统工具)达成跨软件置顶。popup与内容脚本注入更适合浏览器内的短时交互或页面伴随式悬浮,不适用于跨软件置顶。

后续工作包括:补齐平台差异的实测数据(尤其Safari与Firefox对Document PiP或等价能力的支持情况)、完善权限与隐私治理(遵循MV3与Safari权限模型)、建立自动化测试矩阵与用户体验评估机制,确保在多平台、多场景下的稳定性与合规性[^5][^6]。

---

## 参考文献

[^1]: Popups - Mozilla | MDN. https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Popups  
[^2]: browser_action - Mozilla | MDN. https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_action  
[^3]: action.openPopup() - Mozilla | MDN. https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/action/openPopup  
[^4]: Add a popup | Chrome for Developers. https://developer.chrome.com/docs/extensions/develop/ui/add-popup  
[^5]: chrome.action | API | Chrome for Developers. https://developer.chrome.com/docs/extensions/reference/api/action  
[^6]: Safari web extensions | Apple Developer Documentation. https://developer.apple.com/documentation/SafariServices/safari-web-extensions  
[^7]: Creating a Safari web extension | Apple Developer. https://developer.apple.com/documentation/safariservices/creating-a-safari-web-extension  
[^8]: Managing Safari web extension permissions - Apple Developer. https://developer.apple.com/documentation/safariservices/managing-safari-web-extension-permissions  
[^9]: Companion Window | Always on Top (Chrome Web Store). https://chrome-stats.com/d/hhneckfekhpegclkfhefepcjmcnmnpae  
[^10]: Companion Window | Always on Top - Microsoft Edge Addons. https://microsoftedge.microsoft.com/addons/detail/companion-window-always/ceandjlhknhmihabonfegdojnldmjehh  
[^11]: GitHub - Give-Freely/CompanionWindow. https://github.com/Give-Freely/CompanionWindow  
[^12]: Chrome Web Store: Companion Window listing. https://chromewebstore.google.com/detail/companion-window-always/ceandjlhknhmihabonfegdojnldmjehh  
[^13]: PowerToys Always On Top | Microsoft Learn. https://learn.microsoft.com/zh-cn/windows/powertoys/always-on-top  
[^14]: What is in the Chrome Web Store? Investigating Security (arXiv:2406.12710). https://arxiv.org/pdf/2406.12710  
[^15]: Mitigating the Security Risks of Browser Extensions (IEEE Xplore). https://ieeexplore.ieee.org/document/10169483  
[^16]: A Study on Malicious Browser Extensions in 2025 (arXiv:2503.04292). https://arxiv.org/html/2503.04292v1