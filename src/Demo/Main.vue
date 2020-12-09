<template>
  <section>
    <dl key="overview" style="position: fixed; z-index: 2000; top: 0; left: 0; bottom: 0;">
      <button @click="push('drawer')">Push Drawer</button>
      <button @click="push('dialog')">Push Dialog</button>
      <button @click="pop()">Pop</button>
      <button @click="clear()">Clear</button>
    </dl>
    <modal-stack name="default"></modal-stack>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import DemoModal from '../Demo/DemoModal.vue';
import ModalStack from '../ModalStack.vue';
import Modals from '../Modals';

@Component({
  components: {
    ModalStack,
    DemoModal
  }
})
export default class App extends Vue {
  push(layout) {
    Modals.stack().push({
      parent: this,
      layout,
      component: DemoModal,
      default: false,
      props: { rand: Math.random() }
    });
  }

  pop() {
    Modals.stack().pop();
  }

  clear() {
    Modals.stack().clear();
  }
}
</script>
