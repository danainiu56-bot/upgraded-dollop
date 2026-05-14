<script setup>
import { computed, ref } from 'vue';
import Topbar from './components/layout/Topbar.vue';
import Sidebar from './components/layout/Sidebar.vue';
import PageTabs from './components/layout/PageTabs.vue';
import Toast from './components/common/Toast.vue';
import WorkbenchView from './views/WorkbenchView.vue';
import DemandListView from './views/DemandListView.vue';
import CopyListView from './views/CopyListView.vue';
import RequirementReviewView from './views/RequirementReviewView.vue';
import CopyReviewView from './views/CopyReviewView.vue';
import RequirementWizardView from './views/RequirementWizardView.vue';
import ResultView from './views/ResultView.vue';
import AiChatView from './views/AiChatView.vue';
import { getSavedView, saveView } from './core/viewState';
import { useToast } from './core/toast';
import { views } from './router/views';

const activeView = ref(getSavedView() || 'workbench');
const { toast, showToast, clearToast } = useToast();

const activeMeta = computed(() => views.find(item => item.id === activeView.value) || views[0]);

const viewMap = {
  workbench: WorkbenchView,
  demandList: DemandListView,
  copyList: CopyListView,
  requirementReview: RequirementReviewView,
  copyReview: CopyReviewView,
  wizard: RequirementWizardView,
  result: ResultView,
  aiChat: AiChatView,
};

function switchView(id) {
  activeView.value = id;
  saveView(id);
}

function openLegacy() {
  window.location.href = './创建需求-上传页面.html';
}
</script>

<template>
  <Topbar :title="activeMeta.title" @legacy="openLegacy" @create="switchView('wizard')" />

  <div class="app-shell">
    <Sidebar :items="views" :active-id="activeView" @change="switchView" />

    <main class="app-main">
      <PageTabs :active="activeMeta" @legacy="openLegacy" />
      <component
        :is="viewMap[activeView]"
        @navigate="switchView"
        @toast="showToast"
      />
    </main>
  </div>

  <Toast :toast="toast" @clear="clearToast" />
</template>
