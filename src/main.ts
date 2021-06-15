import './Layouts/Drawer.vue';
import './Layouts/Dialog.vue';
import ModalStack from './ModalStack.vue';
import Modals from './Modals';

const VueModals = {
  install(Vue) {
    Vue.component('vue-modals-stack', ModalStack);
    Vue.modals = Vue.prototype.$modals = Modals;
  },
  Modals,
  ModalStack
};

export default VueModals;
