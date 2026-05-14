<script setup>
import { skus } from '../../data/skus';

const model = defineModel({ type: String, default: 'PO17X4011' });
</script>

<template>
  <select v-model="model" class="sku-selector">
    <option v-for="sku in skus" :key="sku.code" :value="sku.code">
      {{ sku.code }} · {{ sku.name }}
    </option>
  </select>
</template>

<style scoped>
.sku-selector {
  width: 100%;
  min-height: 38px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0 10px;
  background: #fff;
}
</style>
