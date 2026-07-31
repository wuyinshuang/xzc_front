<template>
  <div class="pricing-dashboard">
    <div id="screen" ref="screenRef">
      <header>
        <div class="h-left">
          <span class="dot"></span><span>实时数据 · 自动刷新 30s</span>
          <div id="clock" v-html="clockHtml"></div>
        </div>
        <div class="h-center">
          <h1>信贷产品智能定价决策系统</h1>
          <div class="sub">PRICING DECISION · 定价可视化大屏</div>
        </div>
        <div class="h-right">
          <div class="filters">
            <div class="fgroup">产品<select v-model="filters.product" @change="renderAll">
              <option value="全部">全部</option>
              <option value="CASH_LOAN">现金贷</option>
              <option value="CONSUMER_INSTALLMENT">消费贷</option>
              <option value="REVOLVING_CREDIT">循环贷</option>
            </select></div>
            <div class="fgroup">渠道<select v-model="filters.channel" @change="renderAll">
              <option value="全部">全部</option>
              <option value="APP">APP</option>
              <option value="WEB">WEB</option>
            </select></div>
            <div class="fgroup">时间<el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="onDateRangeChange"
              style="width: 220px;"
            /></div>
          </div>
        </div>
      </header>

      <div class="kpis" v-html="kpisHtml"></div>

      <main class="board">
        <div class="col">
          <div class="card" style="flex:1.05">
            <h3> vs 最优利率（按风控档位）</h3>
            <div class="hint">引擎一风险定价与引擎二增量利润优化对比，差值即上浮幅度</div>
            <div ref="cEngine" class="chart"></div>
          </div>
          <div class="card" style="flex:1">
            <h3>上浮幅度分布</h3>
            <div class="hint">最优利率相对基础利率的加价（百分点）</div>
            <div ref="cUplift" class="chart"></div>
          </div>
          <div class="card" style="flex:1.1; overflow: visible; padding-bottom: 6px;">
            <h3 style="margin-bottom:2px;">回溯验证与模型状态</h3>
            <div class="hint" style="margin-bottom:2px;">4 维度月度达标 · V0/V1 模型</div>
            <div style="margin-top:2px; display: grid; grid-template-columns: repeat(2,1fr); gap: 6px;" v-html="backHtml"></div>
            <div style="margin-top:6px; display: grid; grid-template-columns: repeat(2,1fr); gap: 6px;" v-html="modelHtml"></div>
          </div>
        </div>

        <div class="col">
          <div class="card" style="flex:2.5">
            <h3>全国业务分布</h3>
            <div class="hint">各省份业务量分布热力图</div>
            <div style="position: relative; flex: 1; min-height: 0;">
              <div ref="cMap" class="chart" style="width:100%;height:100%;"></div>
              <div class="map-top10" v-html="mapTop10Html"></div>
            </div>
          </div>
          <div class="card" style="flex:1">
            <h3>四情景净收益率对比（压力测试）</h3>
            <div class="hint">基准 / 乐观 / 悲观 / 极端；极端&lt;0 不可行，波动&gt;5% 抗风险弱</div>
            <div ref="cScenario" class="chart"></div>
          </div>
        </div>

        <div class="col">
          <div class="card" style="flex:1.0">
            <h3>敏感度分群</h3>
            <div class="hint">HIGH / MID / LOW 客群占比与各组转化概率</div>
            <div ref="cSens" class="chart"></div>
          </div>
          <div class="card" style="flex:0.9">
            <h3>最终定价分布</h3>
            <div class="hint">客户最终利率区间分布（含监管 / 业务红线）</div>
            <div ref="cDist" class="chart"></div>
          </div>
          <div class="card" style="flex:1.0">
            <h3>ABtest 概览</h3>
            <div class="hint">实验组 vs 对照组（护栏：逾期差&gt;0.5% 自动暂停）</div>
            <div ref="cAb" class="chart"></div>
          </div>
          <div class="card" style="flex:1; overflow: visible;">
            <h3>合规与降级监控</h3>
            <div class="hint">四校验通过率、超红线占比、降级触发率</div>
            <div style="margin-top:4px; display: grid; grid-template-columns: repeat(2,1fr); gap: 6px; padding-bottom: 8px;" v-html="compHtml"></div>
          </div>
        </div>
      </main>

      <div class="foot">版本 V3.8 · 基于《信贷产品智能设计与定价决策系统 — 需求说明书》口径构建 · 数据为双引擎逻辑模拟值，可接入 pricing_decisions / risk_tiers / macro_indicators / abtest_experiments 等数据表</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getPricingScreen, getLoanDisbursementsSummary, getCustomersStatsByProvince, getCustomersTopCities } from '@/api/dashboard'

const TIERS = [1, 2, 3, 4, 5, 6, 7]
const SENS = ['HIGH', 'MID', 'LOW']
const REG_CAP = 24, BIZ_FLOOR = 3.0

const today = new Date()
const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
const filters = reactive({ product: '全部', channel: '全部', dateRange: ['2026-07-01', todayStr] })
const clockHtml = ref('')
const kpisHtml = ref('')
const compHtml = ref('')
const backHtml = ref('')
const modelHtml = ref('')
const mapTop10Html = ref('')
const loading = ref(false)
const rawData = ref(null)

const screenRef = ref(null)
const cEngine = ref(null), cUplift = ref(null), cMap = ref(null)
const cScenario = ref(null), cSens = ref(null), cDist = ref(null), cAb = ref(null)
const charts = {}
let refreshTimer = null
let clockTimer = null
let chinaGeoJson = null

const C = { cyan: '#00e5ff', blue: '#3b9bff', green: '#00f7a8', orange: '#ffb02e', red: '#ff5c7c', purple: '#b98cff', yellow: '#ffe36b', gray: '#5a7299', text: '#d7e7ff', muted: '#7e9bd6' }
const AX = { line: 'rgba(120,160,220,0.35)', split: 'rgba(120,160,220,0.12)', label: '#9fb6e0' }
const baseGrid = { left: 46, right: 18, top: 28, bottom: 28 }
const catAxis = extra => ({ type: 'category', axisLine: { lineStyle: { color: AX.line } }, axisTick: { show: false }, axisLabel: { color: AX.label, fontSize: 11 }, ...extra })
const valAxis = extra => ({ type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: AX.split } }, axisLabel: { color: AX.label, fontSize: 11 }, ...extra })
const legendBase = { textStyle: { color: C.text, fontSize: 12 }, top: 0 }
const tooltipStyle = { backgroundColor: 'rgba(8,24,58,0.95)', borderColor: C.cyan, textStyle: { color: C.text } }
function arrow(d) { return (d >= 0 ? '▲ ' : '▼ ') + Math.abs(d).toFixed(2); }

function onDateRangeChange() {
  renderAll()
}

async function fetchData() {
  loading.value = true
  try {
    const params = {
      product: filters.product,
      channel: filters.channel
    }
    const loanParams = {}
    const customerStatsParams = {}
    const topCitiesParams = {}
    if (filters.dateRange && filters.dateRange.length === 2) {
      const startTime = filters.dateRange[0] + ' 00:00:00'
      const endTime = filters.dateRange[1] + ' 23:59:59'
      params.startTime = startTime
      params.endTime = endTime
      loanParams.startTime = startTime
      loanParams.endTime = endTime
      customerStatsParams.startTime = startTime
      customerStatsParams.endTime = endTime
      topCitiesParams.startTime = startTime
      topCitiesParams.endTime = endTime
    }
    const [data, totalAmount, provinceStats, topCities] = await Promise.all([
      getPricingScreen(params),
      getLoanDisbursementsSummary(loanParams),
      getCustomersStatsByProvince(customerStatsParams),
      getCustomersTopCities(topCitiesParams)
    ])
    const customerCount = (provinceStats || []).reduce((s, item) => s + Number(item.count || 0), 0)
    rawData.value = data
    return { ...data, totalAmount, customerCount, topCities, provinceStats }
  } catch (e) {
    console.error('获取仪表盘数据失败:', e)
    return null
  } finally {
    loading.value = false
  }
}

function processData(d) {
  if (!d) return null

  // 解析敏感度分群（API返回groups数组）
  const sensDist = { HIGH: 0, MID: 0, LOW: 0 }
  const sensConv = { HIGH: 0, MID: 0, LOW: 0 }
  if (d.sensitivity?.groups) {
    d.sensitivity.groups.forEach(g => {
      if (SENS.includes(g.name)) {
        sensDist[g.name] = g.count || 0
        sensConv[g.name] = g.conversion || 0
      }
    })
  }

  // 解析回溯验证（API用threshold，过滤掉稳定性行）
  const back = (d.backtest || []).filter(b => b.metric !== 'PSI').map(item => ({
    name: item.name,
    metric: item.metric,
    val: typeof item.val === 'number' ? item.val.toFixed(2) : item.val,
    unit: item.unit || '',
    th: item.threshold || '',
    pass: item.pass !== undefined ? item.pass : true
  }))

  const totalAmount = d.totalAmount || 0
  const customerCount = d.customerCount || 0
  const processed = {
    totalAmount,
    customerCount,
    topCities: d.topCities || [],
    avgFinalRate: d.kpis?.avgFinalRate || 0,
    avgBaseRate: d.kpis?.avgBaseRate || 0,
    avgUplift: d.kpis?.avgUplift || 0,
    avgConv: d.kpis?.avgConversion || 0,
    avgInc: d.kpis?.avgIncProfit || 0,
    netYield: d.kpis?.netYield || 0,
    delta: d.kpis?.delta || { final: 0, inc: 0, conv: 0, net: 0 },

    byTier: d.byTier || TIERS.map(tier => ({ tier, baseRate: 0, optimalRate: 0, uplift: 0 })),

    ubl: d.upliftDist?.bins || ['0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0+'],
    ubins: d.upliftDist?.counts || [0, 0, 0, 0, 0, 0, 0],

    // 将省份统计接口数据映射为地图可用格式
    provinces: (d.provinceStats || []).map(item => ({
      name: item.province,
      value: Number(item.count || 0),
      ratio: Number(item.ratio || 0)
    })),

    compRate: d.compliance?.compRate || 0,
    degradeRate: d.compliance?.degradeRate || 0,
    overCapRate: d.compliance?.overCapRate || 0,

    sensDist,
    sensConv,

    rbands: ['6-9', '9-12', '12-15', '15-18', '18-21', '21-24', '24+'],
    dbins: d.rateDist?.bins || [0, 0, 0, 0, 0, 0, 0],

    scen: (d.scenarios || []).map(s => ({ name: s.name, net: s.netYield || 0 })),

    back,

    model: {
      v0Status: d.model?.v0Status || 'ACTIVE',
      v1Auc: d.model?.v1Auc || 0,
      v1Active: d.model?.v1Active || false,
      degradeRate: d.model?.degradeRate || 0
    },

    running: d.abtest?.running || 0,
    abExp: d.abtest?.experiments || [{ convE: 0, convC: 0, overE: 0, overC: 0 }]
  }

  processed.extremeBad = processed.scen[3] && processed.scen[3].net < 0
  const scenVals = processed.scen.map(s => s.net)
  processed.weak = scenVals.length > 0 ? (Math.max(...scenVals) - Math.min(...scenVals)) > 5 : false

  return processed
}

async function renderAll() {
  const data = await fetchData()
  const d = processData(data)
  if (!d) {
    console.warn('仪表盘数据为空，使用默认空数据')
    return
  }

  const totalAmountYi = (d.totalAmount / 100000000).toFixed(2)
  const customerCountStr = d.customerCount.toLocaleString()
  const kpis = [
    { l: '投放金额', v: totalAmountYi, u: '亿', dt: 0 },
    { l: '客户数', v: customerCountStr, u: '人', dt: 0 },
    { l: '平均上浮幅度', v: d.avgUplift.toFixed(2), u: '%', dt: 0 },
    { l: '平均转化概率', v: d.avgConv.toFixed(1), u: '%', dt: d.delta.conv || 0 },
    { l: '平均增量利润', v: d.avgInc.toFixed(3), u: '%', dt: Math.abs(d.delta.inc || 0) },
    { l: '净收益率', v: d.netYield.toFixed(2), u: '%', dt: d.delta.net || 0 }
  ]
  kpisHtml.value = kpis.map(k => {
    let dl = ''
    if (k.dt !== 0) {
      const cls = k.dt >= 0 ? 'up' : 'down';
      const arrowChar = k.dt >= 0 ? '▲' : '▼';
      dl = `<div class="delta ${cls}" style="font-size: 12px; margin-top: 4px; color: ${k.dt >= 0 ? '#00f7a8' : '#ff5c7c'}">${arrowChar} ${Math.abs(k.dt).toFixed(2)} 环比</div>`;
    }
    return `<div class="kpi" style="position: relative; background: rgba(13,33,68,0.55); border: 1px solid rgba(0,200,255,0.18); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: center; overflow: hidden; box-shadow: inset 0 0 24px rgba(0,120,220,0.10);">
      <div class="label" style="font-size: 12px; color: #7e9bd6;">${k.l}</div>
      <div class="val" style="margin-top: 6px; display: flex; align-items: baseline; font-variant-numeric: tabular-nums;">
        <span class="num" style="font-size: 34px; font-weight: 900; color: #fff; letter-spacing: 1px;">${k.v}</span>
        <span class="unit" style="font-size: 18px; font-weight: 700; color: #c8dcf5; margin-left: 5px;">${k.u}</span>
      </div>
      ${dl}
    </div>`
  }).join('')

  charts.cEngine.setOption({
    tooltip: { trigger: 'axis', valueFormatter: v => v.toFixed(2) + '%', ...tooltipStyle },
    legend: { data: ['基础利率(引擎一)', '最优利率(引擎二)'], ...legendBase },
    grid: baseGrid,
    xAxis: catAxis({ data: TIERS.map(t => t + '档') }),
    yAxis: valAxis({ name: '%', nameTextStyle: { color: AX.label } }),
    series: [
      { name: '基础利率(引擎一)', type: 'bar', data: d.byTier.map(x => +(x.baseRate || 0).toFixed(2)), itemStyle: { color: 'rgba(59,155,255,0.85)', borderRadius: [4, 4, 0, 0] }, barWidth: '30%',
        markLine: { silent: true, symbol: 'none', data: [[
          { coord: [0, REG_CAP], lineStyle: { color: C.red, type: 'dashed' } },
          { coord: [5.4, REG_CAP], label: { formatter: '监管上限24%', fontSize: 10, color: C.red, position: 'end' } }
        ]] } },
      { name: '最优利率(引擎二)', type: 'bar', data: d.byTier.map(x => +(x.optimalRate || 0).toFixed(2)), itemStyle: { color: C.cyan, borderRadius: [4, 4, 0, 0], shadowBlur: 8, shadowColor: 'rgba(0,229,255,0.5)' }, barWidth: '30%' }
    ]
  }, true)

  charts.cUplift.setOption({
    tooltip: { trigger: 'axis', formatter: p => '上浮 ' + p[0].name + '%<br/>客户数: ' + p[0].value, ...tooltipStyle },
    grid: baseGrid,
    xAxis: catAxis({ data: d.ubl }),
    yAxis: valAxis({ name: '客户数' }),
    series: [{ type: 'bar', data: d.ubins, itemStyle: { color: '#01D597', borderRadius: [4, 4, 0, 0], shadowBlur: 6, shadowColor: 'rgba(1,213,151,0.4)' }, barWidth: '55%', label: { show: true, position: 'top', color: C.text, fontSize: 10 } }]
  }, true)

  // 中国地图 - 使用接口返回的省份数据（仅当地图GeoJSON已加载时渲染）
  if (chinaGeoJson) {
    const provinceData = d.provinces
    charts.cMap.setOption({
      tooltip: {
        trigger: 'item',
        formatter: p => {
          const val = Number(p.value) || 0
          if (val === 0 || !p.data) {
            return `<div style="font-weight:bold;color:#00e5ff;">${p.name}</div>
              <div>客户数: <span style="color:#fff;font-weight:bold;">0</span> 人</div>
              <div>占比: <span style="color:#fff;font-weight:bold;">0.00%</span></div>`
          }
          const ratio = p.data.ratio ? (p.data.ratio * 100).toFixed(2) : '0.00'
          return `<div style="font-weight:bold;color:#00e5ff;">${p.name}</div>
            <div>客户数: <span style="color:#fff;font-weight:bold;">${val}</span> 人</div>
            <div>占比: <span style="color:#fff;font-weight:bold;">${ratio}%</span></div>`
        },
        ...tooltipStyle
      },
      visualMap: {
        min: 0,
        max: provinceData.length > 0 ? Math.max(...provinceData.map(p => p.value || 0), 100) : 100,
        left: 20,
        bottom: 20,
        text: ['高', '低'],
        calculable: true,
        inRange: { color: ['#06203f', '#0a4a78', '#00a3c4', '#00e5ff', '#9af6ff'] },
        textStyle: { color: '#c8dcf5', fontSize: 11 },
        itemWidth: 12,
        itemHeight: 120
      },
      series: [{
        type: 'map',
        map: 'china',
        roam: true,
        zoom: 1.2,
        label: { show: false },
        itemStyle: {
          borderColor: '#00e5ff',
          borderWidth: 1,
          areaColor: '#06203f'
        },
        emphasis: {
          itemStyle: {
            areaColor: '#00e5ff',
            shadowBlur: 20,
            shadowColor: 'rgba(0, 229, 255, 0.5)'
          },
          label: { show: true, color: '#fff' }
        },
        data: provinceData
      }]
    }, true)

    // 生成客户数Top10城市排名（使用新接口数据）
    const topCities = (d.topCities || []).slice(0, 10)
    mapTop10Html.value = '<div class="top10-title">客户数TOP10</div>' + topCities.map((item, idx) => {
      return `<div class="top10-item">
        <span class="top10-rank top10-rank-${idx + 1}">${idx + 1}</span>
        <span class="top10-name">${(item.city || '').replace(/市$/, '')}</span>
        <span class="top10-val">${item.count || 0}</span>
      </div>`
    }).join('')
  }

  compHtml.value = [
    { t: '合规通过率(四校验)', v: d.compRate.toFixed(2) + '%', b: (d.compRate >= 99.9 ? '达标 ≥99.9%' : '未达标'), ok: d.compRate >= 99.9 },
    { t: '超监管上限24%余额', v: d.overCapRate.toFixed(1) + '%', b: (d.overCapRate === 0 ? '0 触碰红线' : '有红线触碰'), ok: d.overCapRate === 0 },
    { t: '降级触发率', v: d.degradeRate.toFixed(2) + '%', b: (d.degradeRate < 1 ? '达标 <1%' : '超标'), ok: d.degradeRate < 1 },
    { t: '净收益率', v: d.netYield.toFixed(2) + '%', b: '利率−预期损失率', ok: true }
  ].map(m => `<div class="mc" style="background: rgba(8,24,58,0.4); border: 1px solid rgba(0,150,200,0.3); border-radius: 6px; padding: 6px 8px; min-height: 60px; display: flex; flex-direction: column; justify-content: center;"><div class="t" style="font-size: 10px; color: #7e9bd6;">${m.t}</div><div class="v" style="font-size: 16px !important; font-weight: 700 !important; color: #fff; margin-top: 2px;">${m.v}</div><div class="b" style="color: #00f7a8 !important; font-size: 9px; margin-top: 1px;">${m.b}</div></div>`).join('')

  charts.cSens.setOption({
    tooltip: { trigger: 'axis', ...tooltipStyle },
    legend: { data: ['客群客户数', '转化概率%'], ...legendBase },
    grid: { left: 44, right: 46, top: 28, bottom: 24 },
    xAxis: catAxis({ data: SENS }),
    yAxis: [valAxis({ name: '客户数' }), valAxis({ name: '转化%' })],
    series: [
      { name: '客群客户数', type: 'bar', data: SENS.map(s => d.sensDist[s]), itemStyle: { color: C.purple, borderRadius: [4, 4, 0, 0] }, barWidth: '35%', label: { show: true, position: 'top', color: C.text, fontSize: 10 } },
      { name: '转化概率%', type: 'line', yAxisIndex: 1, data: SENS.map(s => +d.sensConv[s].toFixed(1)), itemStyle: { color: C.orange }, lineStyle: { width: 2, color: C.orange }, smooth: true, symbol: 'circle', symbolSize: 7 }
    ]
  }, true)

  charts.cDist.setOption({
    tooltip: { trigger: 'axis', formatter: p => d.rbands[p[0].dataIndex] + '% 区间<br/>客户数: ' + p[0].value, ...tooltipStyle },
    grid: baseGrid,
    xAxis: catAxis({ data: d.rbands, axisLabel: { color: AX.label, fontSize: 10 } }),
    yAxis: valAxis({ name: '客户数' }),
    series: [{ type: 'bar', data: d.dbins, itemStyle: { color: 'rgba(59,155,255,0.9)', borderRadius: [4, 4, 0, 0] }, barWidth: '55%',
      markLine: { silent: true, symbol: 'none', data: [{ xAxis: d.rbands[0], label: { formatter: '下限3%', fontSize: 9, color: C.red } }, { xAxis: d.rbands[6], label: { formatter: '上限24%', fontSize: 9, color: C.red } }], lineStyle: { color: C.red, type: 'dashed' } } }]
  }, true)

  const scnColors = ['#01D597', '#01C6E1', '#3387E1', '#FFB02E']
  charts.cScenario.setOption({
    tooltip: { trigger: 'axis', valueFormatter: v => v.toFixed(2) + '%', ...tooltipStyle },
    legend: { show: false },
    grid: baseGrid,
    xAxis: catAxis({ data: d.scen.map(s => s.name), axisLabel: { color: AX.label, fontSize: 12 } }),
    yAxis: valAxis({ name: '净收益率%' }),
    series: [{ type: 'bar', data: d.scen.map((s, i) => ({ value: s.net, itemStyle: { color: scnColors[i], borderRadius: [4, 4, 0, 0] } })), barWidth: '45%',
      label: { show: true, position: 'top', fontSize: 12, color: '#fff', fontWeight: 'bold', formatter: p => p.value + '%' },
      markLine: { silent: true, symbol: 'none', data: [{ yAxis: 0, lineStyle: { color: '#9fb6e0' } }] } }]
  }, true)
  charts.cScenario.setOption({ graphic: [{ type: 'text', right: 14, top: 4,
    style: { text: (d.extremeBad ? '极端情景净收益率<0 → 方案不可行（预警）' : (d.weak ? '情景波动>5% → 抗风险能力弱（预警）' : '四情景净收益率稳健（达标）')),
      fill: (d.extremeBad || d.weak) ? C.red : C.green, fontSize: 12 } }] }, false)

  const ab = d.abExp[0]
  charts.cAb.setOption({
    tooltip: { trigger: 'axis', valueFormatter: v => v + '%', ...tooltipStyle },
    legend: { data: ['实验组', '对照组'], ...legendBase },
    grid: { left: 42, right: 16, top: 28, bottom: 40 },
    xAxis: catAxis({ data: ['转化率', '逾期率'] }),
    yAxis: valAxis({ name: '%' }),
    series: [
      { name: '实验组', type: 'bar', data: [ab.convE, ab.overE], itemStyle: { color: C.cyan, borderRadius: [4, 4, 0, 0] }, barWidth: '30%' },
      { name: '对照组', type: 'bar', data: [ab.convC, ab.overC], itemStyle: { color: C.gray, borderRadius: [4, 4, 0, 0] }, barWidth: '30%' }
    ]
  }, true)
  charts.cAb.setOption({ graphic: [{ type: 'text', right: 8, bottom: 8,
    style: { text: '运行中实验 ' + d.running + ' 个 · 护栏:逾期差>0.5%自动暂停', fill: C.muted, fontSize: 11 } }] }, false)

  backHtml.value = d.back.map(b => {
    const statusColor = b.pass ? '#00f7a8' : '#ff5c7c'
    const statusText = b.pass ? '达标' : '未达标'
    return `<div class="mc" style="background: rgba(8,24,58,0.4); border: 1px solid rgba(0,150,200,0.3); border-radius: 6px; padding: 7px 10px; display: flex; flex-direction: column; justify-content: center;"><div class="t" style="font-size: 11px; color: #7e9bd6;">${b.name} · ${b.metric}</div><div class="v" style="font-size: 20px !important; font-weight: 700 !important; color: #fff; margin-top: 3px;"><span style="font-weight: 700 !important; font-size: 20px !important; color: #fff;">${b.val}</span><span class="back-unit" style="font-size: 12px; color: #7e9bd6; margin-left: 3px;">${b.unit}</span></div><div class="b" style="color: ${statusColor} !important; font-size: 10px; margin-top: 2px;">${statusText} ${b.th}</div></div>`
  }).join('')

  modelHtml.value = [
    { t: 'V0 规则引擎', v: (d.model.v0Status || 'ACTIVE'), tag: 'on', tn: '运行中' },
    { t: 'V1 Logistic 回归', v: 'AUC ' + (d.model.v1Auc || 0).toFixed(2), tag: (d.model.v1Active ? 'on' : 'off'), tn: (d.model.v1Active ? '已激活' : 'ARCHIVED') }
  ].map(m => `<div class="mc" style="background: rgba(8,24,58,0.4); border: 1px solid rgba(0,150,200,0.3); border-radius: 6px; padding: 7px 10px; display: flex; flex-direction: column; justify-content: center;"><div class="t" style="font-size: 11px; color: #7e9bd6;">${m.t}</div><div class="v" style="font-size: 20px !important; font-weight: 700 !important; color: #fff; margin-top: 3px;">${m.v}<span style="margin-left: 6px; font-size: 10px; padding: 2px 5px; border-radius: 4px; background: rgba(0,247,168,0.15); color: #00f7a8;">${m.tn}</span></div></div>`).join('')
}

function tick() {
  const n = new Date()
  const p = x => String(x).padStart(2, '0')
  const w = ['日', '一', '二', '三', '四', '五', '六'][n.getDay()]
  clockHtml.value = '<div class="clock-time">系统时间：' + n.getFullYear() + '-' + p(n.getMonth() + 1) + '-' + p(n.getDate()) + ' 星期' + w + ' ' +
    p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds()) + '</div>'
}

function fitScreen() {
  if (!screenRef.value) return
  resizeCharts()
}

function resizeCharts() {
  Object.values(charts).forEach(c => c && c.resize())
}

onMounted(async () => {
  await nextTick()

  // 先初始化所有图表容器
  charts.cEngine = echarts.init(cEngine.value)
  charts.cUplift = echarts.init(cUplift.value)
  charts.cMap = echarts.init(cMap.value)
  charts.cSens = echarts.init(cSens.value)
  charts.cDist = echarts.init(cDist.value)
  charts.cScenario = echarts.init(cScenario.value)
  charts.cAb = echarts.init(cAb.value)

  // 给地图设置基础配置（即使GeoJSON没加载也先设置框架）
  charts.cMap.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: p => p.name + '<br/>客户数: ' + (p.value || 0) + '人', ...tooltipStyle },
    series: []
  })

  // 自适应屏幕缩放
  const doResize = () => {
    fitScreen()
    resizeCharts()
  }
  doResize()
  ;[100, 300, 500].forEach(ms => setTimeout(doResize, ms))

  // 延迟加载地图，确保容器尺寸稳定后再加载
  setTimeout(async () => {
    try {
      const response = await fetch('./geo/china.json')
      if (!response.ok) {
        // 尝试不同路径
        const resp2 = await fetch('/geo/china.json')
        if (!resp2.ok) throw new Error('地图文件加载失败')
        chinaGeoJson = await resp2.json()
      } else {
        chinaGeoJson = await response.json()
      }
      
      echarts.registerMap('china', chinaGeoJson)
      console.log('中国地图加载成功')
      
      // 渲染地图数据
      renderAll()
      
      // 多次延迟resize确保地图显示
      ;[100, 300, 600, 1000].forEach(ms => {
        setTimeout(() => {
          doResize()
        }, ms)
      })
    } catch (e) {
      console.error('地图加载失败:', e)
    }
  }, 200)

  // 渲染其他内容
  renderAll()

  tick()
  clockTimer = setInterval(tick, 1000)
  refreshTimer = setInterval(renderAll, 30000)
  window.addEventListener('resize', doResize)
})

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (clockTimer) clearInterval(clockTimer)
  const doResize = () => {
    fitScreen()
    resizeCharts()
  }
  window.removeEventListener('resize', doResize)
  Object.values(charts).forEach(c => c && c.dispose())
})
</script>

<style scoped>
.pricing-dashboard {
  position: relative;
  width: 100%;
  min-height: calc(100vh - 84px);
  overflow-y: auto;
  overflow-x: auto;
  background: #040b1c;
  font-family: -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
  color: #d7e7ff;
  background:
    radial-gradient(1200px 700px at 50% -10%, rgba(0,120,220,0.25), transparent 60%),
    radial-gradient(900px 600px at 100% 100%, rgba(0,180,200,0.12), transparent 55%),
    linear-gradient(180deg,#040b1c 0%,#06122c 50%,#040b1c 100%);
}

.pricing-dashboard::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: linear-gradient(rgba(0,160,255,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,160,255,0.05) 1px, transparent 1px);
  background-size: 46px 46px;
}

#screen {
  position: relative;
  width: 100%;
  min-width: 1400px;
  display: flex;
  flex-direction: column;
  padding: 18px 22px 16px;
  z-index: 1;
}

header {
  height: 78px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}
header::after {
  content: "";
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00e5ff, transparent);
  opacity: .7;
}
.h-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #7e9bd6;
  flex: 0 0 auto;
}
.dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #00f7a8;
  box-shadow: 0 0 10px #00f7a8;
  animation: pulse 1.6s infinite;
}
@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: .35 } }
.h-center { text-align: center; flex: 1; }
.h-center h1 {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 3px;
  background: linear-gradient(90deg,#7fe9ff,#ffffff,#7fe9ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 18px rgba(0,200,255,.35);
  margin: 0;
}
.h-center .sub {
  font-size: 13px;
  color: #00e5ff;
  letter-spacing: 6px;
  margin-top: 4px;
  opacity: .85;
}
.h-right {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 0 0 auto;
  justify-content: flex-end;
}
#clock {
  font-size: 15px;
  color: #d7e7ff;
  font-variant-numeric: tabular-nums;
  text-align: left;
  line-height: 1.3;
  margin-left: 10px;
}
.clock-time {
  white-space: nowrap;
}
.filters { display: flex; gap: 8px; }
.fgroup {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #7e9bd6;
}
.fgroup select {
  font-size: 12px;
  padding: 4px 6px;
  border: 1px solid rgba(0,200,255,0.40);
  border-radius: 6px;
  background: rgba(8,24,58,0.9);
  color: #d7e7ff;
  cursor: pointer;
  outline: none;
  width: 80px;
}
:deep(.fgroup .el-date-editor) {
  width: 220px !important;
}
:deep(.fgroup .el-date-editor .el-input__wrapper) {
  background: rgba(8,24,58,0.9) !important;
  border: 1px solid rgba(0,200,255,0.40) !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}
:deep(.fgroup .el-date-editor .el-input__inner),
:deep(.fgroup .el-date-editor .el-range-input) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  background: transparent !important;
}
:deep(.fgroup .el-date-editor .el-input__prefix .el-icon),
:deep(.fgroup .el-date-editor .el-input__suffix .el-icon) {
  color: #7e9bd6 !important;
}
:deep(.fgroup .el-date-editor .el-range-separator) {
  color: #7e9bd6 !important;
}
:deep(.fgroup .el-date-editor input::placeholder) {
  color: #7e9bd6 !important;
}

.kpis {
  height: 118px;
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(6,1fr);
  gap: 12px;
  margin: 12px 0;
}
.kpi {
  position: relative;
  background: rgba(13,33,68,0.55);
  border: 1px solid rgba(0,200,255,0.18);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 0 24px rgba(0,120,220,0.10);
}
.kpi::before {
  content: "";
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #00e5ff, transparent);
}
.kpi .label { font-size: 12px; color: #7e9bd6; }
.kpi .val {
  margin-top: 6px;
  display: flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}
.kpi .val .num {
  font-size: 34px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 0 18px rgba(0,220,255,.6);
  letter-spacing: 1px;
}
.kpi .val .unit {
  font-size: 18px;
  font-weight: 700;
  color: #c8dcf5;
  margin-left: 5px;
}
.kpi .delta { font-size: 12px; margin-top: 4px; }
.up { color: #00f7a8 !important; }
.down { color: #ff5c7c !important; }

.board {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1.42fr 1fr;
  gap: 10px;
  min-height: 700px;
}
.col { display: flex; flex-direction: column; gap: 10px; }
.card {
  position: relative;
  background: rgba(13,33,68,0.55);
  border: 1px solid rgba(0,200,255,0.18);
  border-radius: 10px;
  padding: 8px 10px 6px;
  display: flex;
  flex-direction: column;
  min-height: 220px;
  overflow: visible;
  box-shadow: inset 0 0 30px rgba(0,110,210,0.08);
}
.card::before, .card::after {
  content: "";
  position: absolute;
  width: 14px; height: 14px;
  pointer-events: none;
}
.card::before { left: 6px; top: 6px; border-left: 2px solid #00e5ff; border-top: 2px solid #00e5ff; opacity: .7; }
.card::after { right: 6px; bottom: 6px; border-right: 2px solid #00e5ff; border-bottom: 2px solid #00e5ff; opacity: .7; }
.card h3 {
  font-size: 15px;
  font-weight: 600;
  color: #eaf4ff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}
.card h3::before {
  content: "";
  width: 4px; height: 14px;
  background: #00e5ff;
  border-radius: 2px;
  box-shadow: 0 0 8px #00e5ff;
}
.card .hint { font-size: 12px; color: #7e9bd6; margin: 3px 0 4px; }
.chart { width: 100%; flex: 1; min-height: 0; }
.mini {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 8px;
  overflow: auto;
}
.submini {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 7px;
}
.submini .mc { padding: 6px 9px; }
.submini .mc .t { font-size: 11px; }
.submini .mc .v { font-size: 16px; }
.submini .mc .b { font-size: 10px; }
.mc {
  background: rgba(8,24,58,0.6);
  border: 1px solid rgba(0,200,255,0.18);
  border-radius: 8px;
  padding: 8px 10px;
}
.mc .t { font-size: 12px; color: #7e9bd6; }
.mini .mc .v { font-size: 20px !important; font-weight: 700 !important; margin-top: 3px; color: #fff; font-variant-numeric: tabular-nums; }
.submini .mc .v { font-size: 22px !important; font-weight: 700 !important; margin-top: 3px; color: #fff; font-variant-numeric: tabular-nums; }
.mc .b { font-size: 11px; margin-top: 2px; }
.pass { color: #00f7a8; }
.fail { color: #ff5c7c; }
.tag {
  display: inline-block;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 20px;
  margin-left: 6px;
  vertical-align: middle;
}
.tag.on { background: rgba(0,247,168,0.16); color: #00f7a8; border: 1px solid rgba(0,247,168,.4); }
.tag.off { background: rgba(255,92,124,0.16); color: #ff5c7c; border: 1px solid rgba(255,92,124,.4); }
.foot {
  position: absolute;
  bottom: 2px;
  left: 22px;
  font-size: 11px;
  color: #7e9bd6;
  opacity: .7;
}
.back-mc {
  background: rgba(8,24,58,0.6);
  border: 1px solid rgba(0,200,255,0.4);
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 85px;
}
.back-mc .t { font-size: 12px; color: #c8dcf5; }
.back-mc .v {
  font-size: 20px;
  font-weight: 700;
  margin-top: 3px;
  color: #fff;
  display: flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}
.back-mc .v .back-val {
  font-weight: 700;
  color: #fff;
  font-size: 22px !important;
}
.back-mc .v .back-unit {
  font-size: 13px;
  font-weight: 500;
  color: #7e9bd6;
  margin-left: 2px;
}
.back-mc .b {
  font-size: 10px;
  margin-top: 2px;
  color: #00f7a8 !important;
}
.comp-val {
  font-size: 18px !important;
  font-weight: 700 !important;
}
.map-top10 {
  position: absolute;
  right: 0px;
  bottom: 10px;
  width: 110px;
  background: rgba(8,24,58,0.85);
  border: 1px solid rgba(0,200,255,0.25);
  border-radius: 6px;
  padding: 4px 5px;
  backdrop-filter: blur(4px);
  display: block;
  transform-origin: bottom right;
  transform: scale(0.7);
  overflow: hidden;
}
.top10-title {
  font-size: 12px;
  font-weight: 600;
  color: #00e5ff;
  margin-bottom: 3px;
  padding-bottom: 3px;
  border-bottom: 1px solid rgba(0,200,255,0.2);
  white-space: nowrap;
  display: block;
}
.top10-item {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  font-size: 12px;
  white-space: nowrap;
  flex-wrap: nowrap;
}
.top10-rank {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  background: rgba(0,200,255,0.2);
  color: #7e9bd6;
}
.top10-rank-1 { background: linear-gradient(135deg, #ffb02e, #ff8800); color: #fff; }
.top10-rank-2 { background: linear-gradient(135deg, #c0c0c0, #909090); color: #fff; }
.top10-rank-3 { background: linear-gradient(135deg, #cd7f32, #a06020); color: #fff; }
.top10-name {
  color: #d7e7ff;
  white-space: nowrap;
  display: inline-block;
  flex-shrink: 0;
}
.top10-val {
  color: #00e5ff;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  display: inline-block;
  flex-shrink: 0;
  white-space: nowrap;
  margin-left: 4px;
}
</style>

<style>
/* 日期选择器全局深色样式 */
.el-date-editor.el-range-editor,
.el-date-editor.el-range-editor .el-input__wrapper,
.el-date-editor.el-range-editor .el-range-input,
.el-date-editor.el-range-editor .el-input__inner {
  background-color: rgba(8,24,58,0.9) !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}
.el-date-editor.el-range-editor {
  border: 1px solid rgba(0,200,255,0.40) !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}
.el-date-editor.el-range-editor:hover {
  border-color: rgba(0,229,255,0.6) !important;
}
.el-date-editor .el-range-input {
  background: transparent !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  caret-color: #ffffff !important;
}
.el-date-editor .el-range-separator {
  color: #ffffff !important;
}
.el-date-editor .el-range__icon,
.el-date-editor .el-range__close-icon {
  color: #ffffff !important;
}
.el-date-editor .el-input__wrapper {
  background: rgba(8,24,58,0.9) !important;
  box-shadow: none !important;
}
.el-date-editor input {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}
.el-date-editor input::placeholder {
  color: #7e9bd6 !important;
  -webkit-text-fill-color: #7e9bd6 !important;
}

/* 弹出日历面板深色样式 */
.dark-date-popper {
  background: rgba(8,24,58,0.98) !important;
  border: 1px solid rgba(0,200,255,0.3) !important;
}
.dark-date-popper .el-picker-panel__body-wrapper,
.dark-date-popper .el-picker-panel__body {
  background: transparent !important;
}
.dark-date-popper .el-date-range-picker__content {
  border-color: rgba(0,200,255,0.2) !important;
}
.dark-date-popper .el-picker-panel__icon-btn {
  color: #d7e7ff !important;
}
.dark-date-popper .el-date-table th {
  color: #7e9bd6 !important;
  border-color: rgba(0,200,255,0.1) !important;
}
.dark-date-popper .el-date-table td {
  color: #d7e7ff !important;
}
.dark-date-popper .el-date-table td.available:hover {
  color: #00e5ff !important;
}
.dark-date-popper .el-date-table td.current:not(.disabled) span {
  background: #00e5ff !important;
  color: #040b1c !important;
}
.dark-date-popper .el-date-table td.today span {
  color: #00e5ff !important;
}
.dark-date-popper .el-date-table td.in-range div {
  background: rgba(0,200,255,0.2) !important;
}
.dark-date-popper .el-date-table td.start-date div,
.dark-date-popper .el-date-table td.end-date div {
  background: #00e5ff !important;
  color: #040b1c !important;
}
.dark-date-popper .el-picker-panel__footer {
  background: rgba(8,24,58,0.9) !important;
  border-top-color: rgba(0,200,255,0.1) !important;
}
.dark-date-popper .el-button {
  background: transparent !important;
  border-color: rgba(0,200,255,0.4) !important;
  color: #d7e7ff !important;
}
.dark-date-popper .el-button--primary {
  background: #00e5ff !important;
  border-color: #00e5ff !important;
  color: #040b1c !important;
}
.dark-date-popper .el-date-picker__header-label {
  color: #d7e7ff !important;
}
.dark-date-popper .el-date-picker__header-label:hover {
  color: #00e5ff !important;
}
</style>