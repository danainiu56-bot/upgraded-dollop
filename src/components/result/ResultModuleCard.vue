<script setup>
defineProps({
  title: { type: String, required: true },
  desc: { type: String, default: '' },
});
</script>

<template>
  <section class="result-vue-module">
    <header class="result-vue-head">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ desc }}</p>
      </div>
    </header>
    <div class="result-vue-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.result-vue-module {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: #fff;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.result-vue-module + .result-vue-module {
  margin-top: 16px;
}

.result-vue-head {
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}

.result-vue-head h3 {
  margin: 0;
  font-size: 17px;
}

.result-vue-head p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 13px;
}

.result-vue-body {
  padding: 18px;
}
</style>
