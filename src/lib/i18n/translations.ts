// EN/ZH internationalization for LensDB.
//
// A single dictionary keyed by locale; `t(locale, key, params?)` looks a key up with a simple
// `{name}` interpolation and falls back to English, then to the raw key. Importable from both
// `.svelte` components and plain `.ts` modules (the chart/spec builders), so every user-facing
// string has exactly one source of truth.
//
// Locale lives in the URL path (`/` = EN, `/zh/` = ZH) and is resolved per request in
// `[[lang=lang]]/+layout.ts`, never in a store, so each prerendered page renders in its own
// language during SSR (a store set from an `$effect` would not run on the server).
//
// Canonical values stay canonical. Brand and lens model names are never translated; mount names
// are product names and stay as-is. Only descriptive terms (format, type, focus, yes/no) and UI
// chrome are localized, with internal identity (series names, filter values, color keys) kept on
// the canonical English value.

export type Locale = 'en' | 'zh';

export const LOCALES: Locale[] = ['en', 'zh'];

export function getLocale(lang?: string): Locale {
  return lang === 'zh' ? 'zh' : 'en';
}

type Dict = Record<string, string>;

const en: Dict = {
  // Language switch
  'lang.switch': '中文',
  'lang.aria': 'Switch language',

  // Theme toggle (label describes the target theme, i.e. the result of clicking)
  'theme.toLight': 'Switch to light theme',
  'theme.toDark': 'Switch to dark theme',

  // Home
  'home.title': 'LensDB · Lens comparison chart',
  'home.metaDesc':
    'LensDB: plot every modern mirrorless lens on a configurable focal length by aperture chart. Filter by brand, mount, and format.',
  'home.intro':
    '{count} mirrorless lenses across {brands} brands. Pick any two specs for the axes, color by brand or category, and filter the set. A prime is a point; a zoom is a segment (it slopes when both axes vary across the range). Hover for specs, scroll or pinch to zoom, and click a lens to open its details. Turn on "Tap to compare" to pin lenses for side-by-side comparison instead.',
  'home.coverage': '{shown} of {count} lenses shown.',
  'home.coverageHidden': '{shown} of {count} lenses shown, {hidden} hidden (missing {x} or {y}).',
  'home.priceNote': 'Prices approximate, as of {date}.',

  // Filter panel
  'filter.title': 'Filters',
  'filter.reset': 'Reset all',
  'filter.search': 'Search',
  'filter.searchPlaceholder': 'Brand or model…',
  'filter.brand': 'Brand',
  'filter.mount': 'Mount',
  'filter.format': 'Format',
  'filter.type': 'Type',
  'filter.focusFeatures': 'Focus & features',
  'filter.focusAll': 'All',
  'filter.stabilized': 'Stabilized only',
  'filter.weatherSealed': 'Weather-sealed only',
  'filter.hide': 'Hide filters',
  'filter.show': 'Show filters',
  'mode.compare': 'Tap to compare',
  'mode.compareHint': 'On: tap pins lenses to compare. Off: tap opens lens details.',

  // Range slider
  'range.min': 'Min',
  'range.max': 'Max',
  'range.minAria': '{label} minimum',
  'range.maxAria': '{label} maximum',

  // Axis controls
  'axis.x': 'X axis',
  'axis.y': 'Y axis',
  'axis.colorBy': 'Color by',
  'axis.scaleLog': 'log',
  'axis.scaleLin': 'lin',
  'axis.logarithmic': 'logarithmic',
  'axis.linear': 'linear',
  'axis.scaleAriaX': 'X axis scale: {scale}, toggle',
  'axis.scaleAriaY': 'Y axis scale: {scale}, toggle',
  'axis.toggleTitleX': 'Toggle X log / linear scale',
  'axis.toggleTitleY': 'Toggle Y log / linear scale',
  'chart.aria': 'Scatter chart of {count} lenses, {x} versus {y}',
  'chart.ariaTags': 'Labelled tag chart of {count} lenses',

  // View mode + tag detail
  'view.label': 'View',
  'view.dots': 'Dots',
  'view.tags': 'Tags',
  'tag.detail': 'Tag detail',
  'tag.detailNone': 'None',

  // Axis / spec labels (no unit)
  'axis.focal': 'Focal length',
  'axis.aperture': 'Max aperture',
  'axis.weight': 'Weight',
  'axis.length': 'Length',
  'axis.diameter': 'Diameter',
  'axis.filter': 'Filter thread',
  'axis.minFocus': 'Min focus distance',
  'axis.magnification': 'Max magnification',
  'axis.elements': 'Elements',
  'axis.blades': 'Aperture blades',
  'axis.price': 'Price',
  'axis.year': 'Release year',

  // Axis titles (chart axis names, with unit)
  'axisTitle.focal': 'Focal length (mm)',
  'axisTitle.aperture': 'Max aperture (brighter is up)',
  'axisTitle.weight': 'Weight (g)',
  'axisTitle.length': 'Length (mm)',
  'axisTitle.diameter': 'Diameter (mm)',
  'axisTitle.filter': 'Filter thread (mm)',
  'axisTitle.minFocus': 'Min focus distance (m)',
  'axisTitle.magnification': 'Max magnification (×)',
  'axisTitle.elements': 'Elements',
  'axisTitle.blades': 'Aperture blades',
  'axisTitle.price': 'Price (USD)',
  'axisTitle.year': 'Release year',

  // Color-by
  'colorBy.brand': 'Brand',
  'colorBy.format': 'Format',
  'colorBy.lensType': 'Type',
  'colorBy.focus': 'Focus',
  'colorBy.decade': 'Decade',

  // Terms (descriptive values; internal identity stays canonical)
  'term.fullFrame': 'Full Frame',
  'term.apsc': 'APS-C',
  'term.mft': 'MFT',
  'term.mediumFormat': 'Medium Format',
  'term.prime': 'Prime',
  'term.zoom': 'Zoom',
  'term.autofocus': 'Autofocus',
  'term.manualFocus': 'Manual focus',
  'term.unknown': 'Unknown',
  'term.yes': 'Yes',
  'term.no': 'No',
  'term.decadeSuffix': 's',

  // Spec rows (keys not already covered by axis.*)
  'spec.apertureMin': 'Min aperture',
  'spec.stabilization': 'Stabilization',
  'spec.weatherSealed': 'Weather-sealed',
  'spec.groups': 'Groups',
  'spec.price': 'Price (USD)',
  'spec.msrp': 'MSRP (USD)',
  'spec.source': 'Source',

  // Compare page
  'compare.title': 'Compare lenses · LensDB',
  'compare.metaDesc': 'Side-by-side specification comparison of selected camera lenses.',
  'compare.heading': 'Compare',
  'compare.back': '← Back to chart',
  'compare.clearAll': 'Clear all',
  'compare.exportCsv': 'Export CSV',
  'compare.emptyBefore': 'No lenses pinned yet. Go to the ',
  'compare.emptyLink': 'chart',
  'compare.emptyAfter': ' and click lenses to pin them for comparison.',
  'compare.specCol': 'Spec',
  'compare.remove': 'Remove {name}',
  'compare.note':
    'Highlighted = notable value in a row (widest aperture, lightest, cheapest, closest focus, highest magnification, most blades, newest). Dashes are unsourced (never guessed).',

  // Compare tray
  'tray.count': 'Compare {n}/{max}',
  'tray.remove': 'Remove {name} from comparison',
  'tray.clear': 'Clear',
  'tray.compare': 'Compare →',
  'tray.heading': 'Compare',
  'tray.empty': 'Click lenses in the chart to pin them here.',

  // Lens detail
  'detail.metaDesc':
    '{name}: {focal} {aperture} {type} for {mounts} ({format}). Specs and comparison on LensDB.',
  'detail.pin': 'Pin to compare',
  'detail.pinned': 'Pinned ✓',
  'detail.back': '← Back to chart',
  'detail.backToCompare': '← Back to compare',
  'detail.specs': 'Specifications',
  'detail.manufacturer': 'Manufacturer page ↗',
  'detail.whereItSits': 'Where it sits',
  'detail.similar': 'Similar lenses',
  'detail.miniFocal': 'Focal (mm)',
  'detail.miniAperture': 'aperture',

  // Mobile filter drawer
  'filter.open': 'Filters',
  'filter.close': 'Close filters',
  'filter.activeCount': '{n} active',

  // Data-table fallback (accessible equivalent of the chart)
  'table.toggle': 'Show data table',
  'table.caption': '{shown} of {count} lenses shown, with key specifications.',
  'table.colLens': 'Lens',

  // Site footer
  'footer.copyright': '© {year} Luminoid',
  'footer.methodology': 'About the data',

  // Methodology page
  'method.title': 'About the data · LensDB',
  'method.metaDesc':
    "What LensDB's specs cover, where they come from, and how far to trust them: scope, sources, the nulls-over-guesses policy, pricing, and the data license.",
  'method.heading': 'About the data',
  'method.lead':
    'LensDB plots {count} mirrorless lenses on a configurable chart. This page explains where the numbers come from and how far to trust them.',
  'method.h.scope': 'Scope',
  'method.scope':
    'Coverage is mirrorless, current and recent (roughly 2014 onward), plus iconic rangefinder and classic primes that adapt to mirrorless bodies. First-party lines from Sony, Canon, Nikon, Fujifilm, Panasonic, OM System / Olympus, and Leica sit alongside third-party makers including Sigma, Tamron, Zeiss, Samyang, Voigtländer, Viltrox, Laowa, 7Artisans, TTArtisan, Yongnuo, Meike, and Tokina, across Full Frame, APS-C, and Micro Four Thirds. One row is one optical design: a lens sold in several mounts lists them all and appears once.',
  'method.h.sourcing': 'Sources',
  'method.sourcing':
    'Specifications are verified against manufacturer specification pages, B&H, and DPReview.',
  'method.h.nulls': 'Nulls over guesses',
  'method.nulls':
    'A null is correct; a guessed number is a bug. Where a value could not be confirmed against a reliable source it is left empty rather than estimated, so a blank cell means "not reliably sourced", never "roughly this".',
  'method.h.price': 'Prices',
  'method.price':
    'Prices are approximate US figures and move over time. The chart shows each price as of the last price-check date, and both current street price and original MSRP are recorded where available.',
  'method.h.performance': 'Optical performance',
  'method.performance':
    'Optical-quality scores are deliberately omitted. DXOMark and similar scores are body-dependent and not comparable across mounts, so no sharpness or distortion ranking is presented here.',
  'method.h.coverage': 'Field coverage',
  'method.coverage':
    'How completely each field is populated across the database. Lower numbers reflect specs that manufacturers publish inconsistently, left null rather than guessed.',
  'method.h.license': 'Data & license',
  'method.license':
    'This compilation is released under CC BY-NC-SA 4.0. The specifications are factual data drawn from public manufacturer pages, B&H, and DPReview; no paywalled review data is reproduced, and unsourced values are left null.',
  'method.updated': 'Data last updated {date}. {count} lenses across {brands} brands.',
  'method.coverageField': 'Field',
  'method.coveragePct': 'Populated',
  'method.coverageCaption': 'Percentage of lenses with a value for each field.',

  // Accessibility chrome
  'a11y.skipToContent': 'Skip to content',
  'a11y.siteNav': 'Main',

  // Error / not-found page
  'error.title404': 'Page not found · LensDB',
  'error.titleGeneric': 'Something went wrong · LensDB',
  'error.heading404': 'Page not found',
  'error.headingGeneric': 'Something went wrong',
  'error.lead404': "That page doesn't exist. It may have moved, or the link may be wrong.",
  'error.leadGeneric': 'An unexpected error occurred. Try again, or head back to the chart.',
};

const zh: Dict = {
  // Language switch
  'lang.switch': 'EN',
  'lang.aria': '切换语言',

  // Theme toggle (label describes the target theme, i.e. the result of clicking)
  'theme.toLight': '切换到浅色主题',
  'theme.toDark': '切换到深色主题',

  // Home
  'home.title': 'LensDB · 镜头对比图表',
  'home.metaDesc':
    'LensDB：将每一支现代无反镜头绘制在可自定义的焦距-光圈图表上，可按品牌、卡口和画幅筛选。',
  'home.intro':
    '{count} 支无反镜头，覆盖 {brands} 个品牌。任选两项规格作为坐标轴，按品牌或类别着色，并筛选镜头集合。定焦是一个点，变焦是一条线段（当两个坐标轴都随焦段变化时线段会倾斜）。悬停查看规格，滚动或双指缩放，点击镜头查看其详情；开启「点选对比」后，点击镜头则会将其固定以便并排对比。',
  'home.coverage': '已显示 {count} 支镜头中的 {shown} 支。',
  'home.coverageHidden': '已显示 {count} 支镜头中的 {shown} 支，{hidden} 支因缺少{x}或{y}数据未显示。',
  'home.priceNote': '价格为约值，截至 {date}。',

  // Filter panel
  'filter.title': '筛选',
  'filter.reset': '全部重置',
  'filter.search': '搜索',
  'filter.searchPlaceholder': '品牌或型号…',
  'filter.brand': '品牌',
  'filter.mount': '卡口',
  'filter.format': '画幅',
  'filter.type': '类型',
  'filter.focusFeatures': '对焦与特性',
  'filter.focusAll': '全部',
  'filter.stabilized': '仅防抖',
  'filter.weatherSealed': '仅防尘防滴',
  'filter.hide': '隐藏筛选',
  'filter.show': '显示筛选',
  'mode.compare': '点选对比',
  'mode.compareHint': '开启时：点选镜头加入对比；关闭时：点击镜头查看详情。',

  // Range slider
  'range.min': '最小',
  'range.max': '最大',
  'range.minAria': '{label}最小值',
  'range.maxAria': '{label}最大值',

  // Axis controls
  'axis.x': 'X 轴',
  'axis.y': 'Y 轴',
  'axis.colorBy': '着色依据',
  'axis.scaleLog': '对数',
  'axis.scaleLin': '线性',
  'axis.logarithmic': '对数',
  'axis.linear': '线性',
  'axis.scaleAriaX': 'X 轴刻度：{scale}，点击切换',
  'axis.scaleAriaY': 'Y 轴刻度：{scale}，点击切换',
  'axis.toggleTitleX': '切换 X 轴对数/线性刻度',
  'axis.toggleTitleY': '切换 Y 轴对数/线性刻度',
  'chart.aria': '{count} 支镜头的散点图，横轴为{x}，纵轴为{y}',
  'chart.ariaTags': '{count} 支镜头的标签图',

  // View mode + tag detail
  'view.label': '视图',
  'view.dots': '圆点',
  'view.tags': '标签',
  'tag.detail': '标签附加',
  'tag.detailNone': '无',

  // Axis / spec labels (no unit)
  'axis.focal': '焦距',
  'axis.aperture': '最大光圈',
  'axis.weight': '重量',
  'axis.length': '长度',
  'axis.diameter': '直径',
  'axis.filter': '滤镜口径',
  'axis.minFocus': '最近对焦距离',
  'axis.magnification': '最大放大倍率',
  'axis.elements': '镜片数',
  'axis.blades': '光圈叶片数',
  'axis.price': '价格',
  'axis.year': '发布年份',

  // Axis titles (chart axis names, with unit)
  'axisTitle.focal': '焦距 (mm)',
  'axisTitle.aperture': '最大光圈（越亮越靠上）',
  'axisTitle.weight': '重量 (g)',
  'axisTitle.length': '长度 (mm)',
  'axisTitle.diameter': '直径 (mm)',
  'axisTitle.filter': '滤镜口径 (mm)',
  'axisTitle.minFocus': '最近对焦距离 (m)',
  'axisTitle.magnification': '最大放大倍率 (×)',
  'axisTitle.elements': '镜片数',
  'axisTitle.blades': '光圈叶片数',
  'axisTitle.price': '价格 (USD)',
  'axisTitle.year': '发布年份',

  // Color-by
  'colorBy.brand': '品牌',
  'colorBy.format': '画幅',
  'colorBy.lensType': '类型',
  'colorBy.focus': '对焦',
  'colorBy.decade': '年代',

  // Terms
  'term.fullFrame': '全画幅',
  'term.apsc': 'APS-C',
  'term.mft': 'M4/3',
  'term.mediumFormat': '中画幅',
  'term.prime': '定焦',
  'term.zoom': '变焦',
  'term.autofocus': '自动对焦',
  'term.manualFocus': '手动对焦',
  'term.unknown': '未知',
  'term.yes': '是',
  'term.no': '否',
  'term.decadeSuffix': '年代',

  // Spec rows
  'spec.apertureMin': '最小光圈',
  'spec.stabilization': '防抖',
  'spec.weatherSealed': '防尘防滴',
  'spec.groups': '镜组数',
  'spec.price': '价格 (USD)',
  'spec.msrp': '建议零售价 (USD)',
  'spec.source': '来源',

  // Compare page
  'compare.title': '镜头对比 · LensDB',
  'compare.metaDesc': '所选相机镜头的规格并排对比。',
  'compare.heading': '对比',
  'compare.back': '← 返回图表',
  'compare.clearAll': '全部清除',
  'compare.exportCsv': '导出 CSV',
  'compare.emptyBefore': '还没有固定任何镜头。前往',
  'compare.emptyLink': '图表',
  'compare.emptyAfter': '，点击镜头即可将其固定以便对比。',
  'compare.specCol': '规格',
  'compare.remove': '移除 {name}',
  'compare.note':
    '高亮表示该行的突出值（最大光圈、最轻、最便宜、最近对焦、最高放大倍率、最多光圈叶片、最新）。短横线表示数据缺失（绝不臆测）。',

  // Compare tray
  'tray.count': '对比 {n}/{max}',
  'tray.remove': '从对比中移除 {name}',
  'tray.clear': '清除',
  'tray.compare': '对比 →',
  'tray.heading': '对比',
  'tray.empty': '点击图中的镜头即可固定到此处以便对比。',

  // Lens detail
  'detail.metaDesc': '{name}：{focal} {aperture} {type}，适用于 {mounts}（{format}）。规格与对比尽在 LensDB。',
  'detail.pin': '固定以对比',
  'detail.pinned': '已固定 ✓',
  'detail.back': '← 返回图表',
  'detail.backToCompare': '← 返回对比',
  'detail.specs': '规格参数',
  'detail.manufacturer': '厂商页面 ↗',
  'detail.whereItSits': '在图中的位置',
  'detail.similar': '相似镜头',
  'detail.miniFocal': '焦距 (mm)',
  'detail.miniAperture': '光圈',

  // Mobile filter drawer
  'filter.open': '筛选',
  'filter.close': '关闭筛选',
  'filter.activeCount': '{n} 项生效',

  // Data-table fallback (accessible equivalent of the chart)
  'table.toggle': '显示数据表格',
  'table.caption': '已显示 {count} 支镜头中的 {shown} 支，附主要规格。',
  'table.colLens': '镜头',

  // Site footer
  'footer.copyright': '© {year} Luminoid',
  'footer.methodology': '关于数据',

  // Methodology page
  'method.title': '关于数据 · LensDB',
  'method.metaDesc':
    'LensDB 规格数据涵盖哪些镜头、来自何处，以及可信程度：收录范围、来源、宁缺勿猜原则、价格与数据许可。',
  'method.heading': '关于数据',
  'method.lead':
    'LensDB 将 {count} 支无反镜头绘制在可自定义的图表上。本页说明这些数字的来源，以及可信到何种程度。',
  'method.h.scope': '收录范围',
  'method.scope':
    '收录无反系统的现行与近期镜头（大致自 2014 年起），以及可转接到无反机身的经典旁轴与定焦镜头。第一方包括索尼、佳能、尼康、富士、松下、OM System / 奥林巴斯、徕卡；第三方包括适马、腾龙、蔡司、三阳、福伦达、唯卓仕、老蛙、七工匠、铭匠、永诺、美科、图丽，覆盖全画幅、APS-C 与 M4/3。每一行对应一种光学设计：以多卡口销售的镜头会列出全部卡口，并只出现一次。',
  'method.h.sourcing': '来源',
  'method.sourcing':
    '规格数据对照厂商规格页面、B&H 与 DPReview 进行核验。',
  'method.h.nulls': '宁缺勿猜',
  'method.nulls':
    '留空是正确的，臆测的数字才是错误。凡是无法对照可靠来源确认的数值一律留空而非估算，因此空白单元格表示「未能可靠取得」，绝非「大致如此」。',
  'method.h.price': '价格',
  'method.price':
    '价格为约略的美元数值，且会随时间变动。图表按最近一次价格核对的日期显示价格；在可得的情况下同时记录当前市场价与原始建议零售价。',
  'method.h.performance': '光学表现',
  'method.performance':
    '本站有意不提供光学素质评分。DXOMark 等评分依赖机身且无法跨卡口比较，因此不在此呈现任何锐度或畸变排名。',
  'method.h.coverage': '字段覆盖率',
  'method.coverage':
    '各字段在整个数据库中的填充完整度。较低的数值反映厂商公布不一致的规格，这些一律留空而非臆测。',
  'method.h.license': '数据与许可',
  'method.license':
    '这份整理后的汇编以 CC BY-NC-SA 4.0 发布。规格数据本身为取自公开厂商页面、B&H 与 DPReview 的事实性数据；不复制任何付费评测数据，未经来源核实的数值留空。',
  'method.updated': '数据最后更新于 {date}。共 {count} 支镜头，覆盖 {brands} 个品牌。',
  'method.coverageField': '字段',
  'method.coveragePct': '填充率',
  'method.coverageCaption': '各字段有数值的镜头所占百分比。',

  // Accessibility chrome
  'a11y.skipToContent': '跳到主要内容',
  'a11y.siteNav': '主导航',

  // Error / not-found page
  'error.title404': '页面未找到 · LensDB',
  'error.titleGeneric': '出错了 · LensDB',
  'error.heading404': '页面未找到',
  'error.headingGeneric': '出错了',
  'error.lead404': '该页面不存在，可能已移动或链接有误。',
  'error.leadGeneric': '发生了意外错误。请重试，或返回图表。',
};

const dict: Record<Locale, Dict> = { en, zh };

/** Look up a key, with `{name}` interpolation; falls back to EN, then the raw key. */
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let s = dict[locale]?.[key] ?? dict.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

// ---- Canonical value -> translated label --------------------------------------------------
//
// These map the canonical English values that live in the data and the filter/chart internals
// onto their localized display form. The canonical value is always returned unchanged for EN
// and as the fallback, so an unmapped value (a new brand, an unforeseen format) shows verbatim.

const FORMAT_KEY: Record<string, string> = {
  'Full Frame': 'term.fullFrame',
  'APS-C': 'term.apsc',
  MFT: 'term.mft',
  'Medium Format': 'term.mediumFormat',
};
const TYPE_KEY: Record<string, string> = { Prime: 'term.prime', Zoom: 'term.zoom' };
const FOCUS_KEY: Record<string, string> = {
  Autofocus: 'term.autofocus',
  'Manual focus': 'term.manualFocus',
  Unknown: 'term.unknown',
};

// Brand display names for Chinese. Used on UI surfaces only (legend, tag chips, tooltip, detail and
// compare tables); page <title> / OG / Twitter meta keep the canonical Latin brand so English brand
// names stay discoverable. A brand with no established Chinese name (e.g. OM System) falls back to
// the canonical string, as does any future brand not listed here.
const BRAND_ZH: Record<string, string> = {
  Canon: '佳能',
  Nikon: '尼康',
  Sony: '索尼',
  Fujifilm: '富士',
  Panasonic: '松下',
  Olympus: '奥林巴斯',
  Leica: '徕卡',
  Zeiss: '蔡司',
  Sigma: '适马',
  Tamron: '腾龙',
  Tokina: '图丽',
  Voigtländer: '福伦达',
  Samyang: '三阳',
  Viltrox: '唯卓仕',
  Laowa: '老蛙',
  '7Artisans': '七工匠',
  TTArtisan: '铭匠',
  Meike: '美科',
  Yongnuo: '永诺',
};

export const tFormat = (locale: Locale, v: string): string =>
  FORMAT_KEY[v] ? t(locale, FORMAT_KEY[v]) : v;
export const tType = (locale: Locale, v: string): string =>
  TYPE_KEY[v] ? t(locale, TYPE_KEY[v]) : v;
export const tFocus = (locale: Locale, v: string): string =>
  FOCUS_KEY[v] ? t(locale, FOCUS_KEY[v]) : v;

/**
 * Localized brand name for display on UI surfaces. Returns the canonical brand for EN and as the
 * fallback for any brand without a Chinese name, so the data/filter identity is never affected.
 * Do NOT use in <title> / OG / Twitter meta, which keep the canonical Latin form.
 */
export const tBrand = (locale: Locale, v: string): string =>
  locale === 'zh' && BRAND_ZH[v] ? BRAND_ZH[v] : v;

/**
 * Translate a color-by legend group name for display while its canonical value stays the series
 * identity / color key. Decade groups ("2010s", "Unknown") are handled specially.
 */
export function groupLabel(locale: Locale, colorKey: string, value: string): string {
  switch (colorKey) {
    case 'format':
      return tFormat(locale, value);
    case 'lensType':
      return tType(locale, value);
    case 'focus':
      return tFocus(locale, value);
    case 'decade':
      if (value === 'Unknown') return t(locale, 'term.unknown');
      // "2010s" -> "2010" + localized suffix
      return value.replace(/s$/, '') + t(locale, 'term.decadeSuffix');
    case 'brand':
      return tBrand(locale, value);
    default:
      return value;
  }
}

// ---- Path helpers ---------------------------------------------------------------------------

/** Build a locale-prefixed, trailing-slashed internal href from a base path (always EN-rooted). */
export function localePath(locale: Locale, path: string): string {
  let clean = path.startsWith('/') ? path : `/${path}`;
  if (!clean.endsWith('/')) clean += '/';
  return locale === 'zh' ? `/zh${clean}` : clean;
}

/** Toggle the `/zh` prefix on a pathname (preserves the rest of the path). */
export function switchLocalePath(pathname: string): string {
  let path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (path === '/zh' || path.startsWith('/zh/')) return path.slice(3) || '/';
  return `/zh${path}`;
}
