<script setup>
defineProps({
  active: { type: Object, required: true },
});

defineEmits(['legacy']);
</script>

<template>
  <div class="vue-page-tabs">
    <div class="vue-page-tab muted">首页</div>
    <div class="vue-page-tab active">{{ active.title }}</div>
    <button class="vue-page-tab legacy" type="button" @click="$emit('legacy')">旧版完整原型</button>
  </div>
</template>

<style scoped>
.vue-page-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.vue-page-tab {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #fff;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
}

.vue-page-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.vue-page-tab.legacy {
  margin-left: auto;
  cursor: pointer;
}
</style>
