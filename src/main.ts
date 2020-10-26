import Vue from "vue";
import Demo from '@/Demo.vue'
import DemoModal from '@/DemoModal.vue'

Vue.component('DemoModal', DemoModal)

new Vue({
  render: h => h(Demo)
}).$mount('#app');