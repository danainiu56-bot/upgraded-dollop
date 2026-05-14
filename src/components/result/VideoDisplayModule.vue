<script setup>
import { sellingVideo } from '../../data/resultMock';
import ResultModuleCard from './ResultModuleCard.vue';
</script>

<template>
  <ResultModuleCard title="卖点展示" desc="序号、卖点、画面展示、中文文案和时间戳">
    <div class="video-display-list">
      <article v-for="item in sellingVideo.displays" :key="item.no" class="video-display-row">
        <strong>{{ String(item.no).padStart(2, '0') }}</strong>
        <div><span>卖点</span>{{ item.point }}</div>
        <div><span>画面展示</span>{{ item.visual }}</div>
        <div><span>中文文案</span>{{ item.copy }}</div>
        <div><span>时间戳</span><em>{{ item.timestamp }}</em></div>
      </article>
    </div>
  </ResultModuleCard>
</template>

<style scoped>
.video-display-list {
  display: grid;
  gap: 12px;
}

.video-display-row {
  display: grid;
  grid-template-columns: 52px minmax(120px, 0.18fr) minmax(0, 0.36fr) minmax(0, 0.32fr) 110px;
  gap: 10px;
  align-items: stretch;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fbfdff;
}

.video-display-row > strong {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: #fff;
}

.video-display-row div {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  color: var(--text);
  font-size: 13px;
  line-height: 1.6;
}

.video-display-row span {
  display: block;
  margin-bottom: 5px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 800;
}

.video-display-row em {
  font-style: normal;
  color: #1d4ed8;
  font-weight: 900;
  white-space: nowrap;
}
</style>
