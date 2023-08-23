<template>
  <section>
    <dl key="overview" style="position: fixed; z-index: 2000; top: 0; left: 0; bottom: 0">
      <button @click="push('drawer')">Push Drawer</button>
      <button @click="push('dialog')">Push Dialog</button>
      <button @click="pop()">Pop</button>
      <button @click="clear()">Clear</button>
    </dl>
    <modal-stack name="default"></modal-stack>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import DemoModal from '../Demo/DemoModal.vue';
import ModalStack from '../ModalStack.vue';
import Modals from '../Modals';

export default defineComponent({
  components: {
    ModalStack,
    DemoModal,
  },
  methods: {
    push(layout: string) {
      Modals.stack().push({
        parent: this,
        layout,
        component: DemoModal,
        showClose: true,
        default: false,
        props: { rand: Math.random() },
      });
    },

    pop() {
      Modals.stack().pop();
    },

    clear() {
      Modals.stack().clear();
    },
  },
});
</script>
