import { reactive } from 'vue';

export function useToast() {
  const toast = reactive({
    visible: false,
    message: '',
    type: 'info',
  });

  function showToast(message, type = 'info') {
    toast.message = message;
    toast.type = type;
    toast.visible = true;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.visible = false;
    }, 2400);
  }

  function clearToast() {
    toast.visible = false;
  }

  return { toast, showToast, clearToast };
}
