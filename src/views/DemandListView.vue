<script setup>
import { demandList } from '../data/demandList';

defineEmits(['navigate']);
</script>

<template>
  <section class="view-card">
    <header class="view-card-head">
      <div>
        <div class="view-card-title">需求管理</div>
        <div class="view-card-desc">需求列表已拆为独立 Vue 页面，表格字段保持现有业务口径。</div>
      </div>
      <button class="btn btn-primary btn-sm" type="button" @click="$emit('navigate', 'wizard')">创建需求</button>
    </header>

    <div class="view-card-body">
      <table class="data-table">
        <thead>
          <tr>
            <th>需求类型</th>
            <th>站点</th>
            <th>品牌</th>
            <th>SKU</th>
            <th>优先级</th>
            <th>开卖时间</th>
            <th>期望交付</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in demandList" :key="row.id">
            <td>{{ row.type }}</td>
            <td>{{ row.site }}</td>
            <td>{{ row.brand }}</td>
            <td>{{ row.sku }}</td>
            <td><span class="tag">{{ row.priority }}</span></td>
            <td>{{ row.launchDate }}</td>
            <td>{{ row.dueDate }}</td>
            <td>{{ row.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
