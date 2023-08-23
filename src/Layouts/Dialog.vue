<template>
  <section layout="dialog" :class="classes">
    <div class="header" v-if="showClose">
      <button class="close-button" @click="$emit('close')">×</button>
    </div>
    <div class="content">
      <slot></slot>
    </div>
    <div class="footer"></div>
  </section>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Modal } from '../Types';

export default defineComponent({
  props: {
    stack: {
      type: Object as PropType<Modal[]>,
      readonly: true,
    },
    index: {
      type: Number,
      readonly: true,
    },
    modal: {
      type: Object as PropType<Modal>,
      readonly: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    classes() {
      return { center: true };
    },
  },
});
</script>

<style lang="scss">
section[layout='dialog'] {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  border-radius: 4px;
  background: white;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  max-width: calc(100vw - 64px);
  max-height: calc(100vh - 64px);
  height: min-content;

  transition: transform 0.3s ease-in-out, opacity 0.3s linear;
  opacity: 1;
  transform: translateY(0px) translateX(-50%);

  &.center {
    top: 50%;
    transform: translateY(-50%) translateX(-50%);
  }

  &.modal-enter,
  &.modal-leave-to {
    transform: translateY(0px) translateX(-50%) scale(0.9);
    opacity: 0;

    &.center {
      top: 50%;
      transform: translateY(-50%) translateX(-50%) scale(0.9);
    }
  }

  & .header {
    flex: auto 0 0;
    height: 0;

    & .close-button {
      z-index: 100;

      position: absolute;
      right: 0;
      font-size: 20px;
      color: darkslategrey;
      background: none;

      border: none;
      border-radius: 16px;
      height: 32px;
      width: 32px;
    }
  }

  & .content {
    flex: auto 1 1;
    overflow-y: auto;
  }

  & .header {
    flex: auto 0 0;
  }
}
</style>
