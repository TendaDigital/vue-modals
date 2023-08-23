import './style.css';
import './Layouts/Drawer.vue';
import './Layouts/Dialog.vue';
import ModalStack from './ModalStack.vue';
import Modals from './Modals';
import Demo from './Demo/Main.vue';
import { createApp, App, inject } from 'vue';
import LayoutDialog from './Layouts/Dialog.vue';
import LayoutDrawer from './Layouts/Drawer.vue';

const VueModals = {
  install(app: App) {
    app.component('vue-modals-stack', ModalStack);
    app.config.globalProperties.$modals = Modals;

    app.component('dialog', LayoutDialog);
    app.component('drawer', LayoutDrawer);

    app.provide('modals', app.config.globalProperties.$modals);
  },

  useVueModals() {
    const vueModals = inject<Modals>('modals');
    if (!vueModals) {
      throw new Error('No modals provided');
    }
    return vueModals;
  },
  Modals,
  ModalStack,
};

export default VueModals;

const app = createApp(Demo);

app.use(VueModals);

app.mount('#app');
