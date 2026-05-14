<script setup>
defineProps({
  toast: { type: Object, required: true },
});

defineEmits(['clear']);
</script>

<template>
  <button
    v-if="toast.visible"
    type="button"
    class="vue-toast"
    :class="toast.type"
    @click="$emit('clear')"
  >
    {{ toast.message }}
  </button>
</template>

<style scoped>
.vue-toast {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 50;
  padding: 12px 16px;
  border: 0;
  border-radius: 12px;
  background: #111827;
  color: #fff;
  box-shadow: var(--shadow-lg);
  cursor: pointer;
}

.vue-toast.success {
  background: #059669;
}

.vue-toast.warning {
  background: #d97706;
}
</style>
