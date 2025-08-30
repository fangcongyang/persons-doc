<template>
  <div class="button-group-container">
    <div
      v-for="(item, index) in buttons"
      :key="index"
      class="button-item"
      :class="{ active: activeIndex === index }"
      @click="handleClick(index)"
    >
      {{ item.label }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  // 按钮数据
  buttons: {
    type: Array,
    default: () => [
      { label: '就诊类型', value: 'visitType' },
      { label: '医保类别', value: 'insuranceType' },
      { label: '收费项目类别', value: 'feeItemType' }
    ],
  },
  // 默认选中的按钮索引
  defaultActive: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['change'])

const activeIndex = ref(props.defaultActive)

const handleClick = (index) => {
  activeIndex.value = index
  emit('change', props.buttons[index].value, index)
}
</script>

<style lang="less" scoped>
.button-group-container {
  display: flex;
  border-bottom: 1px solid #e8e8e8;

  .button-item {
    padding: 8px 16px;
    cursor: pointer;
    position: relative;
    font-size: 14px;
    color: #606266;
    transition: all 0.3s;

    &:hover {
      color: #1890ff;
    }

    &.active {
      color: #1890ff;
      font-weight: 500;

      &:after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: #1890ff;
      }
    }
  }
}
</style>
