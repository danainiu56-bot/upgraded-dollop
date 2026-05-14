<template>
  <section class="view-card">
    <header class="view-card-head">
      <div>
        <div class="view-card-title">文案审核</div>
        <div class="view-card-desc">右侧重点提交内容、左侧辅助资料的审核结构已作为 Vue 页面边界。</div>
      </div>
    </header>
    <div class="view-card-body copy-review-shell">
      <aside>
        <h4>AI 评分 / 风险建议</h4>
        <p>AI 总分 88，风险等级中。建议关注 GEO 本地化和合规表达。</p>
      </aside>
      <main>
        <h4>提交内容</h4>
        <p>AUVON Weekly Pill Organizer, 7 Day Pill Box for Vitamins and Medicine...</p>
      </main>
    </div>
  </section>
</template>

<style scoped>
.copy-review-shell {
  display: grid;
  grid-template-columns: minmax(260px, 0.36fr) minmax(0, 0.64fr);
  gap: 16px;
}

.copy-review-shell > * {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fbfdff;
}
</style>
