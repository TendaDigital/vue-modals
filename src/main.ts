import Vue from "vue";
import Demo from '@/Demo/Main.vue'
import '@/Layouts/Drawer.vue'
import '@/Layouts/Dialog.vue'

// Vue.component('Drawer', Drawer)

new Vue({
  render: h => h(Demo)
}).$mount('#app');