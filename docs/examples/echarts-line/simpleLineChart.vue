<template>
  <div class="data-overview">
    <div class="chart-header">
      <div class="chart-title">
        <div class="title-bar" />
        {{ lineTitle }}
      </div>
      <div class="chart-tabs">
        <button-group
          :buttons="chartTypeData"
          @change="handleButtonGroupChange"
        />
      </div>
    </div>
    <div class="lineChart">
      <div id="lineChart" ref="chartRef" class="chart" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import buttonGroup from './buttonGroup.vue'

const props = defineProps({
  lineTitle: {
    type: String,
    default: '费用分布',
  },
  chartType: {
    type: String,
    default: '',
  },
  chartTypeData: {
    type: Array,
    default: () => [{
      label: '人员类型',
      value: 'psnType',
    },{
      label: 'xx类型',
      value: 'xxType',
    }],
  },
  chartData: {
    type: Object,
    default: () => ({
      xData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      legendData: ['xx', 'xxx'],
      yData: [[12000, 10000, 5000, 8000, 4000, 12000, 10000, 5000, 8000, 4000, 12000, 10000], 
      [1000, 8000, 10000, 8000, 14000, 12000, 10000, 5000, 8000, 4000, 12000, 10000]],
    }),
  },
  onLineChartTypeChange: {
    type: Function,
    default: () => () => {},
  },
  yAxis: {
    type: Object,
    default: undefined,
  },
  onLineChartTypeItemChange: {
    type: Function,
    default: () => () => {},
  },
})

const emit = defineEmits(['onLineChartTypeChange', 'onLineChartTypeItemChange'])

const chartRef = ref(null)
let lineChart = null
const seriesType = ref('line')
const seriesSmooth = ref('true')
const seriesData = ref([])

const options = reactive({
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    boundaryGap: false,
    data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  },
  yAxis: {
    type: 'value',
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
  },
  legend: {
    data: [],
    top: 4,
    right: '10%',
  },
  series: [],
  graphic: {
    elements: [
      {
        type: 'text',
        left: '6%',
        top: 10,
        style: {
          text: '单位：万元',
          fontSize: 14,
          lineDash: [0, 200],
          lineDashOffset: 0,
          fill: '#000',
          textAlign: 'center',
          textVerticalAlign: 'middle',
          width: '10%',
          height: 30,
        },
        id: 'unit',
        invisible: false,
      }
    ],
  },
})

const initChart = () => {
  seriesData.value.forEach((item, index) => {
    options.series[index] = {
      name: options.legend.data[index],
      data: item,
      type: seriesType.value,
      smooth: seriesSmooth.value,
    }
  })
  
  if (lineChart) {
    lineChart.dispose()
  }
  
  lineChart = echarts.init(chartRef.value)
  lineChart.setOption(options)

  // 处理窗口大小变化
  window.addEventListener('resize', () => {
    lineChart.resize()
  })
  
  lineChart.on('click', (params) => {
    emit('onLineChartTypeItemChange', params.seriesName)
  })
}

const handleButtonGroupChange = (value, index) => {
  emit('onLineChartTypeChange', value)
  emit('onLineChartTypeItemChange', '总费用')
}

watch(() => props.chartData, (newVal) => {
  if (newVal && newVal.xData && newVal.xData.length > 0) {
    options.xAxis.data = newVal.xData
    options.legend.data = newVal.legendData
    seriesData.value = newVal.yData
    initChart()
  }
}, { deep: true })

onMounted(() => {
  if (props.yAxis) {
    options.yAxis = props.yAxis
  }
  
  if (props.chartData && props.chartData.xData && props.chartData.xData.length > 0) {
    options.xAxis.data = props.chartData.xData
    options.legend.data = props.chartData.legendData
    seriesData.value = props.chartData.yData
  }
  
  initChart()
})
</script>

<style lang="less" scoped>
.data-overview {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  width: 100%;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  .chart-title {
    font-size: 16px;
    font-weight: bold;
    color: #303133;

    .title-bar {
      width: 6px;
      height: 16px;
      background-color: blue;
      margin-right: 6px;
      display: inline-block;
    }

    i {
      margin-right: 8px;
      color: #409eff;
    }
  }

  .chart-tabs {
    display: flex;
    justify-content: center;
    flex: 1 1 0;
  }
}

.lineChart {
  width: 100%;
  height: 100%;
}
.chart {
    height: 330px;
}
</style>
  