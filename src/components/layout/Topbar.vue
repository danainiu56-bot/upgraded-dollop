<script setup>
defineProps({
  title: { type: String, default: '' },
});

defineEmits(['legacy', 'create']);
</script>

<template>
  <header class="vue-topbar">
    <button class="vue-logo" type="button" @click="$emit('legacy')">
      <span class="vue-logo-mark">PTM</span>
      <span>产品到营销系统</span>
    </button>

    <div class="vue-topbar-title">{{ title }}</div>

    <div class="vue-topbar-actions">
      <button class="btn btn-secondary btn-sm" type="button" @click="$emit('legacy')">旧版原型</button>
      <button class="btn btn-primary btn-sm" type="button" @click="$emit('create')">创建需求</button>
    </div>
  </header>
</template>

<style scoped>
.vue-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 60px;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 0 22px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
}

.vue-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  color: var(--text);
  font-weight: 900;
  cursor: pointer;
}

.vue-logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: #fff;
  font-size: 11px;
  letter-spacing: 0.4px;
}

.vue-topbar-title {
  flex: 1;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 700;
}

.vue-topbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
</style>
