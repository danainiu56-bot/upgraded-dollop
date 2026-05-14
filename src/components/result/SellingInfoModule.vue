<script setup>
import { sellingVideo } from '../../data/resultMock';
import ResultModuleCard from './ResultModuleCard.vue';

const groups = [
  { key: 'usp', code: 'USP', name: '独特卖点' },
  { key: 'ksp', code: 'KSP', name: '核心卖点' },
  { key: 'osp', code: 'OSP', name: '补充卖点' },
];
</script>

<template>
  <ResultModuleCard title="卖点信息" desc="按照 USP / KSP / OSP 分组展示">
    <div class="selling-groups">
      <section v-for="group in groups" :key="group.key" class="selling-group">
        <div class="selling-group-head">
          <span>{{ group.code }}</span>
          <strong>{{ group.name }}</strong>
        </div>
        <article v-for="item in sellingVideo[group.key]" :key="item.title" class="selling-item">
          <strong>{{ item.title }}</strong>
          <p>{{ item.desc }}</p>
        </article>
      </section>
    </div>
  </ResultModuleCard>
</template>

<style scoped>
.selling-groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.selling-group {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fbfdff;
}

.selling-group-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.selling-group-head span {
  padding: 3px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 900;
}

.selling-item {
  padding: 10px 0;
  border-top: 1px dashed var(--border);
}

.selling-item p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.65;
}
</style>
