<script setup>
import { ref } from 'vue';
import { aiSkills } from '../data/aiSkills';

const messages = ref([
  { role: 'ai', text: '请选择一个文案方向，我会生成初稿并给出评分理由。' },
]);

function sendDraft(skill) {
  messages.value.push({ role: 'user', text: `使用 ${skill.name} 生成文案` });
  messages.value.push({ role: 'ai', text: `${skill.name} 初稿：围绕产品卖点、场景和合规表达生成一版可编辑内容。` });
}
</script>

<template>
  <section class="ai-vue-layout">
    <aside class="view-card ai-side">
      <header class="view-card-head"><div class="view-card-title">Skills</div></header>
      <div class="view-card-body">
        <button v-for="skill in aiSkills" :key="skill.id" class="ai-skill" type="button" @click="sendDraft(skill)">
          <strong>{{ skill.name }}</strong>
          <span>{{ skill.desc }}</span>
        </button>
      </div>
    </aside>

    <main class="view-card">
      <header class="view-card-head">
        <div>
          <div class="view-card-title">AI 文案生成</div>
          <div class="view-card-desc">草稿生成、评分和调优对话会继续沉淀在该组件下。</div>
        </div>
      </header>
      <div class="view-card-body ai-messages">
        <div v-for="(msg, index) in messages" :key="index" :class="['ai-message', msg.role]">{{ msg.text }}</div>
      </div>
    </main>
  </section>
</template>

<style scoped>
.ai-vue-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
}

.ai-skill {
  width: 100%;
  display: grid;
  gap: 4px;
  margin-bottom: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.ai-skill span {
  color: var(--text-muted);
  font-size: 12px;
}

.ai-messages {
  display: grid;
  gap: 12px;
}

.ai-message {
  max-width: 70%;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f8fafc;
}

.ai-message.user {
  justify-self: end;
  background: #eef2ff;
}
</style>
