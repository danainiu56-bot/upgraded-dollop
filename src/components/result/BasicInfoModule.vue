<script setup>
import { resultBasic } from '../../data/resultMock';
import ResultModuleCard from './ResultModuleCard.vue';
</script>

<template>
  <ResultModuleCard title="基础信息" desc="类型、站点、品牌、SKU、优先级和文案人员">
    <div class="basic-grid">
      <div v-for="item in resultBasic" :key="item.label" class="basic-item">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
  </ResultModuleCard>
</template>

<style scoped>
.basic-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.basic-item {
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fbfdff;
}

.basic-item span {
  display: block;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 800;
}

.basic-item strong {
  display: block;
  margin-top: 6px;
}
</style>
