<script setup>
const stats = [
  { label: '需求总量', value: 128 },
  { label: '审核通过率', value: '91%' },
  { label: 'AI 采纳率', value: '76%' },
  { label: '准时交付率', value: '88%' },
];

const distributions = [
  { name: '物理治疗', total: 46, risk: 6 },
  { name: '家居关怀', total: 35, risk: 3 },
  { name: '健康护理', total: 47, risk: 8 },
];
</script>

<template>
  <section class="view-card">
    <header class="view-card-head">
      <div>
        <div class="view-card-title">管理驾驶舱</div>
        <div class="view-card-desc">从整体、业务类型和人员维度查看需求健康度。</div>
      </div>
    </header>

    <div class="view-card-body">
      <div class="stat-grid">
        <div v-for="item in stats" :key="item.label" class="stat-card">
          <div class="stat-label">{{ item.label }}</div>
          <div class="stat-value">{{ item.value }}</div>
        </div>
      </div>

      <div class="wb-vue-grid">
        <article v-for="item in distributions" :key="item.name" class="wb-vue-card">
          <strong>{{ item.name }}</strong>
          <p>总量 {{ item.total }} · 风险 {{ item.risk }}</p>
          <div class="wb-vue-bar"><span :style="{ width: Math.min(item.total, 100) + '%' }" /></div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wb-vue-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.wb-vue-card {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
}

.wb-vue-card p {
  color: var(--text-muted);
}

.wb-vue-bar {
  height: 8px;
  border-radius: 999px;
  background: #eef2ff;
  overflow: hidden;
}

.wb-vue-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--primary);
}
</style>
