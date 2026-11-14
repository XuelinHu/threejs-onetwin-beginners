const view = document.querySelector('#view');
const status = document.querySelector('#status');

async function main() {
  const response = await fetch('./source/template.json');
  if (!response.ok) throw new Error(`模板读取失败：HTTP ${response.status}`);
  const template = await response.json();
  document.querySelector('#name').textContent = `${template.name} · 趋势图练习`;
  const source = template.canvasData.find(item => item.component === 'Chart').propValue;
  const option = structuredClone(source.option);
  option.xAxis[0].data = source.data.xData;
  option.series.forEach((series, index) => { series.data = source.data.seriesData[index] || []; });
  option.legend.data = option.series.map(series => series.name);
  option.grid = { left: '12%', right: '8%', top: '28%', bottom: '12%', containLabel: true };
  const chart = echarts.init(view);
  chart.setOption(option);
  addEventListener('resize', () => chart.resize());
  status.textContent = '修改 source.data，再调用 chart.setOption(option) 即可更新趋势。主页面的能源管线也是二维图形。';
  window.practice = { template, chart, option };
}
main().catch(error => { status.textContent = `加载失败：${error.message}`; console.error(error); });
