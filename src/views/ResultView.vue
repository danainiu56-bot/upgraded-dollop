<script setup>
import BasicInfoModule from '../components/result/BasicInfoModule.vue';
import CompetitorInfoModule from '../components/result/CompetitorInfoModule.vue';
import SellingInfoModule from '../components/result/SellingInfoModule.vue';
import VideoDisplayModule from '../components/result/VideoDisplayModule.vue';

defineEmits(['navigate', 'toast']);
</script>

<template>
  <div class="result-vue-layout">
    <aside class="result-vue-nav view-card">
      <strong>内容大纲</strong>
      <a href="#vue-basic">基础信息</a>
      <a href="#vue-competitor">竞对信息</a>
      <a href="#vue-selling">卖点信息</a>
      <a href="#vue-video">卖点展示</a>
    </aside>

    <main class="result-vue-content">
      <div id="vue-basic"><BasicInfoModule /></div>
      <div id="vue-competitor"><CompetitorInfoModule /></div>
      <div id="vue-selling"><SellingInfoModule /></div>
      <div id="vue-video"><VideoDisplayModule /></div>

      <div class="result-vue-actions">
        <button class="btn btn-secondary" type="button" @click="$emit('navigate', 'wizard')">返回修改</button>
        <button class="btn btn-success" type="button" @click="$emit('toast', '需求已提交', 'success')">提交需求</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.result-vue-layout {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.result-vue-nav {
  position: sticky;
  top: 78px;
  display: grid;
  gap: 10px;
  padding: 16px;
}

.result-vue-nav a {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.result-vue-content {
  min-width: 0;
}

.result-vue-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
