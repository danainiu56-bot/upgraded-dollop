<script setup>
import { computed } from 'vue';
import { iconOf } from '../../core/icons';

const props = defineProps({
  items: { type: Array, required: true },
  activeId: { type: String, required: true },
});

defineEmits(['change']);

const groups = computed(() => [...new Set(props.items.map(item => item.group))]);
</script>

<template>
  <aside class="vue-sidebar">
    <div
      v-for="group in groups"
      :key="group"
      class="vue-sidebar-group"
    >
      <div class="vue-sidebar-group-title">{{ group }}</div>
      <button
        v-for="item in items.filter(view => view.group === group)"
        :key="item.id"
        type="button"
        class="vue-sidebar-item"
        :class="{ active: item.id === activeId }"
        @click="$emit('change', item.id)"
      >
        <span class="vue-sidebar-icon">{{ iconOf(item.id) }}</span>
        <span>{{ item.title }}</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.vue-sidebar {
  min-height: calc(100vh - 60px);
  padding: 18px 14px;
  border-right: 1px solid var(--border);
  background: #fff;
}

.vue-sidebar-group + .vue-sidebar-group {
  margin-top: 20px;
}

.vue-sidebar-group-title {
  padding: 0 10px 8px;
  color: var(--text-light);
  font-size: 12px;
  font-weight: 800;
}

.vue-sidebar-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: var(--text-muted);
  font-weight: 700;
  cursor: pointer;
}

.vue-sidebar-item:hover,
.vue-sidebar-item.active {
  background: #eef2ff;
  color: #3730a3;
}

.vue-sidebar-icon {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  font-size: 11px;
  font-weight: 900;
}
</style>
