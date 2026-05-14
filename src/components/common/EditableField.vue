<script setup>
const model = defineModel({ type: [String, Number], default: '' });

defineProps({
  multiline: { type: Boolean, default: false },
});
</script>

<template>
  <textarea
    v-if="multiline"
    v-model="model"
    class="vue-editable multiline"
  />
  <input
    v-else
    v-model="model"
    class="vue-editable"
  />
</template>

<style scoped>
.vue-editable {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
}

.vue-editable:focus {
  outline: none;
  border-color: var(--primary-light);
  background: #fff;
}

.vue-editable.multiline {
  min-height: 68px;
  resize: vertical;
}
</style>
