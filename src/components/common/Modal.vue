<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
});

defineEmits(['close']);
</script>

<template>
  <div v-if="open" class="vue-modal-overlay" @click.self="$emit('close')">
    <section class="vue-modal">
      <header class="vue-modal-head">
        <h3>{{ title }}</h3>
        <button type="button" @click="$emit('close')">×</button>
      </header>
      <div class="vue-modal-body">
        <slot />
      </div>
    </section>
  </div>
</template>

<style scoped>
.vue-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.42);
}

.vue-modal {
  width: min(760px, calc(100vw - 40px));
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--shadow-lg);
}

.vue-modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}

.vue-modal-head h3 {
  margin: 0;
}

.vue-modal-head button {
  border: 0;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
}

.vue-modal-body {
  padding: 18px;
}
</style>
