<script setup>
import { copyList } from '../data/copyList';

defineEmits(['navigate', 'toast']);
</script>

<template>
  <section class="view-card">
    <header class="view-card-head">
      <div>
        <div class="view-card-title">文案管理</div>
        <div class="view-card-desc">文案生成、草稿选择、AI 对话入口拆为 Vue 页面入口。</div>
      </div>
    </header>

    <div class="view-card-body">
      <table class="data-table">
        <thead>
          <tr>
            <th>需求类型</th>
            <th>SKU</th>
            <th>产品</th>
            <th>文案人员</th>
            <th>AI 评分</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in copyList" :key="row.id">
            <td>{{ row.type }}</td>
            <td>{{ row.sku }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.writer }}</td>
            <td>{{ row.score }}</td>
            <td>{{ row.status }}</td>
            <td>
              <button class="btn btn-secondary btn-sm" type="button" @click="$emit('navigate', 'aiChat')">文案生成</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
