'use client';

import { useEffect } from 'react';
import type { Locale } from '@/lib/i18n';

const exactPairs: Array<[string, string]> = [
  ['点击或拖拽文件到此处', 'Click or drag a file here'],
  ['支持点击选择或拖拽上传', 'Click to choose or drag to upload'],
  ['获取客户端信息', 'Get client info'],
  ['开始查询', 'Start lookup'],
  ['开始 Ping', 'Start ping'],
  ['扫描端口', 'Scan ports'],
  ['检测状态', 'Check status'],
  ['提取元数据', 'Extract metadata'],
  ['提取图片', 'Extract images'],
  ['转换为 Markdown', 'Convert to Markdown'],
  ['生成 llms.txt', 'Generate llms.txt'],
  ['下载 llms.txt', 'Download llms.txt'],
  ['复制', 'Copy'],
  ['已复制', 'Copied'],
  ['复制结果', 'Copy result'],
  ['复制文本', 'Copy text'],
  ['复制标签', 'Copy tags'],
  ['复制 JSON-LD', 'Copy JSON-LD'],
  ['下载文件', 'Download file'],
  ['下载', 'Download'],
  ['下载 robots.txt', 'Download robots.txt'],
  ['解析并预览', 'Parse and preview'],
  ['美化', 'Format'],
  ['压缩', 'Minify'],
  ['计算', 'Calculate'],
  ['计算 MD5', 'Calculate MD5'],
  ['开始混淆', 'Start obfuscation'],
  ['开始压缩', 'Start minifying'],
  ['处理中…', 'Processing...'],
  ['加载中...', 'Loading...'],
  ['生成二维码', 'Generate QR code'],
  ['下载 PNG', 'Download PNG'],
  ['转成 PNG', 'Convert to PNG'],
  ['下载压缩图', 'Download compressed image'],
  ['下载 GIF', 'Download GIF'],
  ['正在生成 GIF，请稍等…', 'Generating GIF, please wait...'],
  ['解析参数', 'Parse parameters'],
  ['当前没有命中内置词表。', 'No matches in the built-in list.'],
  ['无匹配', 'No matches'],
  ['全部超时', 'All timed out'],
  ['未发现', 'Not found'],
  ['开放', 'Open'],
  ['搜索', 'Search'],
  ['随机', 'Random'],
  ['全部', 'All'],
  ['返回', 'Back'],
  ['返回上页', 'Go back'],
  ['返回首页', 'Back home'],
  ['关闭', 'Close'],
  ['上一张', 'Previous image'],
  ['下一张', 'Next image'],
  ['上一个作品', 'Previous work'],
  ['下一个作品', 'Next work'],
  ['上一个游戏', 'Previous game'],
  ['下一个游戏', 'Next game'],
  ['上一篇文章', 'Previous post'],
  ['下一篇文章', 'Next post'],
  ['截图待补充', 'Screenshot coming soon'],
  ['加载天气信息失败', 'Failed to load weather'],
  ['数据来源于和风天气', 'Data from QWeather'],
  ['播放列表', 'Playlist'],
  ['即将播放', 'Coming up'],
  ['加载更多', 'Load more'],
  ['暂无歌词', 'No lyrics yet'],
  ['等待歌词...', 'Waiting for lyrics...'],
  ['暂无更多歌曲', 'No more songs'],
  ['暂无文章...', 'No posts yet...'],
  ['全部文章', 'All posts'],
  ['没有找到匹配的文章', 'No matching posts found'],
  ['加载失败，请重试', 'Load failed. Please retry.'],
  ['继续阅读', 'Continue reading'],
  ['重试', 'Retry'],
  ['已经到底啦 (｡･ω･｡)', 'You have reached the end'],
  ['文章归档', 'Article archive'],
  ['关于我', 'About me'],
  ['音乐播放器', 'Music player'],
  ['作品展示', 'Works'],
  ['页面不存在', 'Page not found'],
  ['抱歉，你访问的页面走丢了', 'Sorry, the page you visited is missing'],
  ['你可能在寻找：', 'You might be looking for:'],
  ['切换亮色主题', 'Switch to light theme'],
  ['切换暗色主题', 'Switch to dark theme'],
  ['跟随系统主题', 'Use system theme'],
  ['打开菜单', 'Open menu'],
  ['关闭菜单', 'Close menu'],
  ['打开侧边栏', 'Open sidebar'],
  ['关闭侧边栏', 'Close sidebar'],
  ['管理员', 'Admin'],
  ['管理后台', 'Admin dashboard'],
  ['退出登录', 'Sign out'],
  ['无法加载预览', 'Unable to load preview'],
  ['查看演示', 'View demo'],
  ['博客统计', 'Blog stats'],
  ['文章数', 'Posts'],
  ['运行时间', 'Uptime'],
  ['最后更新', 'Last updated'],
  ['代码', 'Code'],
  ['暂无流量来源数据。', 'No traffic source data yet.'],
  ['请输入要查询的域名。', 'Please enter a domain to query.'],
  ['全球排名', 'Global rank'],
  ['关键词', 'Keyword'],
  ['排名', 'Rank'],
  ['流量占比', 'Traffic share'],
  ['搜索量', 'Search volume'],
  ['难度', 'Difficulty'],
  ['颜色转换', 'Color conversion'],
  ['对比度检测 (WCAG)', 'Contrast check (WCAG)'],
  ['CSS 渐变生成', 'CSS gradient generator'],
  ['本地生成多尺寸 PNG 图标', 'Generate multi-size PNG icons locally'],
  ['颜色', 'Color'],
  ['每月月供', 'Monthly payment'],
  ['首月 / 末月', 'First / last month'],
  ['总利息', 'Total interest'],
  ['总还款', 'Total repayment'],
  ['应纳税所得额', 'Taxable income'],
  ['应缴个税', 'Income tax'],
  ['税后到手', 'After-tax income'],
  ['相差天数', 'Day difference'],
  ['约', 'About'],
  ['年/月', 'Year / month'],
  ['生成数量', 'Quantity'],
  ['姓名', 'Name'],
  ['手机号', 'Phone'],
  ['邮箱', 'Email'],
  ['地址', 'Address'],
  ['证件号(虚构)', 'ID number (fictional)'],
  ['本地时间', 'Local time'],
  ['秒', 'Seconds'],
  ['毫秒', 'Milliseconds'],
  ['与预期哈希一致。', 'Matches the expected hash.'],
  ['与预期哈希不一致。', 'Does not match the expected hash.'],
  ['答案之书', 'Book of Answers'],
  ['随机诗词', 'Random poetry'],
  ['历史今天', 'Today in History'],
  ['皮肤', 'Skin'],
  ['披风', 'Cape'],
  ['在线状态', 'Online status'],
  ['在线', 'Online'],
  ['离线', 'Offline'],
  ['版本', 'Version'],
  ['城市', 'City'],
  ['时区', 'Timezone'],
  ['号码', 'Number'],
  ['省份', 'Province'],
  ['运营商', 'Carrier'],
  ['原图大小', 'Original size'],
  ['输出大小', 'Output size'],
  ['例如 openai.com', 'For example openai.com'],
  ['搜索文章...', 'Search posts...'],
  ['目标主机', 'Target host'],
  ['端口，例如 443', 'Port, for example 443'],
  ['例如 80,443,3000-3005', 'For example 80,443,3000-3005'],
  ['例如 https://openai.com', 'For example https://openai.com'],
  ['输入网页 URL', 'Enter webpage URL'],
  ['输入二维码内容', 'Enter QR code content'],
  ['输入待计算文本', 'Enter text to calculate'],
  ['可选：输入预期 MD5 做比对', 'Optional: enter expected MD5 to compare'],
  ['粘贴 JavaScript、CSS 或 HTML 代码', 'Paste JavaScript, CSS, or HTML code'],
  ['粘贴完整 URL、a=1&b=2 或 JSON', 'Paste a full URL, a=1&b=2, or JSON'],
  ['把要检测的文本贴进来', 'Paste text to check'],
  ['质量 0~1', 'Quality 0-1'],
  ['最大宽度', 'Max width'],
  ['输入即可搜索...', 'Type to search...'],
  ['搜索类型、风格、标签...', 'Search type, style, tag...'],
  ['输入关键词搜索设计', 'Enter keywords to search designs'],
  ['输入域名，例如 example.com', 'Enter a domain, for example example.com'],
  ['在这里输入或粘贴文本，实时统计字数', 'Enter or paste text here to count in real time'],
  ['输入金额，例如 10086.55', 'Enter an amount, for example 10086.55'],
  ['输入正则表达式', 'Enter a regular expression'],
  ['输入要匹配的测试文本', 'Enter test text to match'],
  ['前景色', 'Foreground color'],
  ['背景色', 'Background color'],
  ['角度', 'Angle'],
  ['请输入二维码内容。', 'Please enter QR code content.'],
  ['请输入 Base64 内容。', 'Please enter Base64 content.'],
  ['请输入完整的 SVG 代码。', 'Please enter complete SVG code.'],
  ['无法初始化画布。', 'Unable to initialize canvas.'],
  ['请输入密码。', 'Please enter a password.'],
  ['粘贴 JWT Token（eyJ...）', 'Paste JWT Token (eyJ...)'],
  ['字段解析失败', 'Failed to parse fields'],
  ['分 时 日 月 周，例如 0 9 * * 1-5', 'Minute hour day month weekday, for example 0 9 * * 1-5'],
  ['一年内没有匹配的执行时间', 'No matching run time within one year'],
  ['输入要计算哈希的文本', 'Enter text to hash'],
  ['进制需在 2-36 之间', 'Base must be between 2 and 36'],
  ['输入数值', 'Enter value'],
  ['源进制(2-36)', 'Source base (2-36)'],
  ['原始文本', 'Original text'],
  ['对比文本', 'Comparison text'],
  ['输入任意命名，如 hello world / helloWorld / hello_world', 'Enter any name, such as hello world / helloWorld / hello_world'],
  ['输入中文，转换为拼音', 'Enter Chinese text to convert to pinyin'],
  ['输入密码', 'Enter password'],
  ['输入文本或 Base64 内容', 'Enter text or Base64 content'],
  ['这里会显示图片 Base64，也可以直接粘贴现成的 Base64', 'Image Base64 will appear here, or you can paste existing Base64'],
  ['长度，例如 16', 'Length, for example 16'],
  ['例如 1715664000000 或 2026-05-14 12:00:00', 'For example 1715664000000 or 2026-05-14 12:00:00'],
  ['输入问题', 'Enter a question'],
  ['月', 'Month'],
  ['日', 'Day'],
  ['邮箱地址', 'Email address'],
  ['可留空，默认查询当前访问 IP', 'Leave empty to query the current request IP'],
  ['点击或拖拽图片到此处', 'Click or drag an image here'],
  ['处理全部在浏览器本地完成', 'Processing runs locally in your browser'],
  ['宽', 'Width'],
  ['高', 'Height'],
  ['水印文字', 'Watermark text'],
  ['代码语言', 'Code language'],
  ['处理模式', 'Processing mode'],
  ['混淆强度', 'Obfuscation strength'],
  ['选择压缩格式', 'Choose compression format'],
  ['选择结构化数据类型', 'Choose structured data type'],
  ['文章 Article', 'Article'],
  ['网站 WebSite', 'WebSite'],
  ['组织 Organization', 'Organization'],
  ['页面标题 Title', 'Page title'],
  ['页面描述 Description', 'Page description'],
  ['关键词，逗号分隔（可选）', 'Keywords, comma-separated (optional)'],
  ['规范链接 URL', 'Canonical URL'],
  ['站点名称（可选）', 'Site name (optional)'],
  ['社交分享图 URL（可选）', 'Social image URL (optional)'],
  ['User-agent（默认 *）', 'User-agent (default *)'],
  ['Sitemap 地址，每行一个（可选）', 'Sitemap URL, one per line (optional)'],
  ['文章标题 headline', 'Article headline'],
  ['名称 name', 'Name'],
  ['描述 description（可选）', 'Description (optional)'],
  ['作者 author（可选）', 'Author (optional)'],
  ['发布日期', 'Publish date'],
  ['Logo 图片 URL（可选）', 'Logo image URL (optional)'],
  ['图片 URL（可选）', 'Image URL (optional)'],
  ['粘贴要分析的正文内容', 'Paste content to analyze'],
  ['目标关键词（可选）', 'Target keyword (optional)'],
  ['站点标题', 'Site title'],
  ['主语言', 'Primary language'],
  ['站点地址', 'Site URL'],
  ['语言版本', 'Language versions'],
  ['主要栏目数', 'Primary sections'],
  ['总字数（去空白）', 'Characters excluding whitespace'],
  ['分词数', 'Tokens'],
];

const exactText = new Map(exactPairs);

function normalize(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function compact(value: string) {
  return normalize(value).replace(/[，。：“”「」『』、\s]/g, '');
}

function translateDynamic(value: string) {
  const source = normalize(value);
  if (!source) return source;

  const direct = exactText.get(source) ?? exactText.get(compact(source));
  if (direct) return direct;

  const replacements: Array<[RegExp, string | ((match: RegExpMatchArray) => string)]> = [
    [/^共\s*(\d+)\s*张图片$/, (match) => `${match[1]} images extracted`],
    [/^共提取\s*(\d+)\s*张图片$/, (match) => `${match[1]} images extracted`],
    [/^共\s*(\d+)\s*首歌曲$/, (match) => `${match[1]} songs`],
    [/^第\s*(\d+)\s*张$/, (match) => `Image ${match[1]}`],
    [/^前往作品\s*(\d+)$/, (match) => `Go to work ${match[1]}`],
    [/^前往游戏\s*(\d+)$/, (match) => `Go to game ${match[1]}`],
    [/^前往文章\s*(\d+)$/, (match) => `Go to post ${match[1]}`],
    [/^状态：(.+)$/, (match) => `Status: ${match[1]}`],
    [/^最终地址：(.+)$/, (match) => `Final URL: ${match[1]}`],
    [/^类型：(.+)$/, (match) => `Type: ${match[1]}`],
    [/^长度：(.+)$/, (match) => `Length: ${match[1]}`],
    [/^标题：(.+)$/, (match) => `Title: ${match[1]}`],
    [/^描述：(.+)$/, (match) => `Description: ${match[1]}`],
    [/^平均延迟：(.+)$/, (match) => `Average latency: ${match[1]}`],
    [/^开放端口：(.+)$/, (match) => `Open ports: ${match[1]}`],
    [/^站点标题：(.+)$/, (match) => `Site title: ${match[1]}`],
    [/^主语言：(.+)$/, (match) => `Primary language: ${match[1]}`],
    [/^站点地址：(.+)$/, (match) => `Site URL: ${match[1]}`],
    [/^语言版本：(.+)$/, (match) => `Language versions: ${match[1]}`],
    [/^主要栏目数：(.+)$/, (match) => `Primary sections: ${match[1]}`],
    [/^主要栏目数：(\d+)\s*个$/, (match) => `Primary sections: ${match[1]}`],
    [/^语言版本：\s*(\d+)\s*个$/, (match) => `Language versions: ${match[1]}`],
    [/^标题\s*(\d+)\s*字符.+$/, (match) => `Title ${match[1]} characters (recommended <= 60)`],
    [/^描述\s*(\d+)\s*字符.+$/, (match) => `Description ${match[1]} characters (recommended <= 160)`],
    [/^总字数.+：(.+)$/, (match) => `Characters excluding whitespace: ${match[1]}`],
    [/^分词数：(.+)$/, (match) => `Tokens: ${match[1]}`],
    [/^关键词「(.+)」出现\s*(\d+)\s*次，密度\s*(.+)$/, (match) => `Keyword "${match[1]}" appears ${match[2]} times, density ${match[3]}`],
    [/^高频词 Top (.+)$/, (match) => `Top words ${match[1]}`],
    [/^(.+)\s*字$/, (match) => `${match[1]} characters`],
    [/^(\d+)\s*天$/, (match) => `${match[1]} days`],
    [/^(.+)\s*周$/, (match) => `${match[1]} weeks`],
    [/^共\s*(\d+)\s*首歌曲$/, (match) => `${match[1]} songs`],
    [/^(\d+)年$/, (match) => `${match[1]} years`],
    [/^(\d+)天前$/, (match) => `${match[1]} days ago`],
    [/^(.+)：(.+)$/, (match) => {
      const translatedLabel = exactText.get(match[1]);
      return translatedLabel ? `${translatedLabel}: ${match[2]}` : match[0];
    }],
    [/^命中\s*(\d+)\s*个词条：?$/, (match) => `${match[1]} matches:`],
    [/^原始：(.+)$/, (match) => `Original: ${match[1]}`],
    [/^结果：(.+)$/, (match) => `Result: ${match[1]}`],
    [/^体积比：(.+)$/, (match) => `Ratio: ${match[1]}`],
    [/^模式：混淆$/, 'Mode: Obfuscate'],
    [/^模式：压缩$/, 'Mode: Minify'],
    [/^压缩前\s*(.+)\s*·\s*压缩后\s*(.+)\s*·\s*输出\s*(.+)$/, (match) => `Before ${match[1]} · After ${match[2]} · Output ${match[3]}`],
  ];

  for (const [pattern, replacement] of replacements) {
    const match = source.match(pattern);
    if (!match) continue;
    return typeof replacement === 'function' ? replacement(match) : replacement;
  }

  return source;
}

function shouldSkip(node: Node) {
  const element = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  return Boolean(element?.closest('article, pre, code, textarea, input, [data-i18n-skip]'));
}

function translateTextNode(node: Text) {
  if (shouldSkip(node)) return;
  const original = node.nodeValue ?? '';
  const translated = translateDynamic(original);
  if (translated !== normalize(original)) node.nodeValue = original.replace(normalize(original), translated);
}

function translateElementAttributes(element: Element) {
  if (element.closest('article, pre, code, [data-i18n-skip]')) return;
  for (const attr of ['placeholder', 'aria-label', 'title', 'alt']) {
    const value = element.getAttribute(attr);
    if (!value) continue;
    const translated = translateDynamic(value);
    if (translated !== normalize(value)) element.setAttribute(attr, translated);
  }
}

function translateTree(root: ParentNode) {
  if (root instanceof Element) translateElementAttributes(root);

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text);
    if (node.nodeType === Node.ELEMENT_NODE) translateElementAttributes(node as Element);
    node = walker.nextNode();
  }
}

export default function DomTextTranslator({ locale }: { locale: Locale }) {
  useEffect(() => {
    if (locale !== 'en') return;

    translateTree(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) translateTextNode(node as Text);
          if (node.nodeType === Node.ELEMENT_NODE) translateTree(node as Element);
        });
        if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
          translateTextNode(mutation.target as Text);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale]);

  return null;
}
