<template>
  <section layout="drawer" :style="{ '--depth': depth }">
    {{ depth }}
    <slot></slot>
  </section>
</template>

<script lang="ts">
import { Modal } from '@/Types';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class LayoutDrawer extends Vue {
  @Prop()
  readonly stack: Modal[];

  @Prop()
  readonly index: number;

  @Prop()
  readonly modal: Modal;

  get depth() {
    if (this.modal.options.props.hideLastDrawer) {
      return 0;
    }
    const drawers = this.stack.filter(s => s.options.layout === 'drawer');
    const index = drawers.findIndex(m => m === this.modal);
    return drawers.length - index - 1;
  }
}

// Register component
Vue.component('drawer', LayoutDrawer);
</script>
<style lang="scss">
section[layout='drawer'] {
  background: white;

  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: auto;

  min-width: 300px;

  transition: transform 0.4s ease-in-out;
  transform: translateX(max(0px, calc(100vw - 100% - 100px * var(--depth))));

  &.modal-enter,
  &.modal-leave-to {
    transform: translateX(calc(100vw));
  }
}
</style>
