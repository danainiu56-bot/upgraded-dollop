<script setup>
import { sellingVideo } from '../../data/resultMock';
import ResultModuleCard from './ResultModuleCard.vue';
</script>

<template>
  <ResultModuleCard title="竞对信息" desc="参考链接与视频脚本参考重点">
    <div class="competitor-grid">
      <article v-for="item in sellingVideo.competitors" :key="item.label" class="competitor-card">
        <div class="competitor-card-head">
          <span>{{ item.label }}</span>
          <strong>{{ item.source }}</strong>
        </div>
        <p>{{ item.point }}</p>
        <a :href="item.link" target="_blank" rel="noopener">查看 Amazon</a>
      </article>
    </div>
  </ResultModuleCard>
</template>

<style scoped>
.competitor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.competitor-card {
  padding: 14px;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  background: #f8fbff;
}

.competitor-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.competitor-card-head span {
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 800;
}

.competitor-card p {
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.competitor-card a {
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
}
</style>
