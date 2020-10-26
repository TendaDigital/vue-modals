<template>
  <section>
    <dl key="overview" style="position: fixed; z-index: 1000;">
      <button @click="push()">Push</button>
      <button @click="pop()">Pop</button>
      <button @click="clear()">Clear</button>
    </dl>
    <modal-stack name="default"></modal-stack>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ModalStack from './ModalStack.vue'
import Modals from './Modals';
import { ModalOptions } from './Types';

@Component({
  components: {
    ModalStack
  },
})
export default class App extends Vue {
  push() {
    Modals.get().push({
      parent: this,
      component: 'DemoModal', 
      default: false, 
      props: {rand: Math.random()}
    })
  }

  pop() {
    Modals.get().pop()
  }

  clear() {
    Modals.get().clear()
  }
}
</script>