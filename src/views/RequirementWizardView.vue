<script setup>
import { ref } from 'vue';
import SkuSelector from '../components/common/SkuSelector.vue';
import { reqTypes, sites } from '../data/reqTypes';

const emit = defineEmits(['navigate', 'toast']);

const form = ref({
  type: 'new-listing',
  site: sites[0],
  sku: 'PO17X4011',
  priority: 'P1',
  launchDate: '2026-06-01',
  dueDate: '2026-05-18',
});

function parseRequirement() {
  emit('toast', '已进入解析结果页', 'success');
  emit('navigate', 'result');
}
</script>

<template>
  <section class="view-card">
    <header class="view-card-head">
      <div>
        <div class="view-card-title">创建需求</div>
        <div class="view-card-desc">Step 1 / Step 2 表单已拆为 Vue 视图，后续可继续拆成 WizardStep 组件。</div>
      </div>
    </header>

    <div class="view-card-body wizard-grid">
      <label>
        需求类型
        <select v-model="form.type">
          <option v-for="item in reqTypes" :key="item.id" :value="item.id">{{ item.label }}</option>
        </select>
      </label>
      <label>
        站点
        <select v-model="form.site">
          <option v-for="site in sites" :key="site">{{ site }}</option>
        </select>
      </label>
      <label>
        SKU
        <SkuSelector v-model="form.sku" />
      </label>
      <label>
        优先级
        <select v-model="form.priority">
          <option>P0</option>
          <option>P1</option>
          <option>P2</option>
        </select>
      </label>
      <label>
        产品开卖时间
        <input v-model="form.launchDate" type="date" />
      </label>
      <label>
        期望交付时间
        <input v-model="form.dueDate" type="date" />
      </label>
      <div class="wizard-actions">
        <button class="btn btn-primary" type="button" @click="parseRequirement">开始解析</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wizard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.wizard-grid label {
  display: grid;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
}

.wizard-grid input,
.wizard-grid select {
  min-height: 38px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 10px;
  background: #fff;
}

.wizard-actions {
  grid-column: 1 / -1;
}
</style>
