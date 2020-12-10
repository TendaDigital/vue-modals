<template>
  <!-- <aside class="vue-modals-stack" :name="name"> -->
  <transition-group tag="div" :stack="name" name="modal">
    <template v-for="(modal, index) in stack">
      <div
        v-if="!modal.options.hideOverlay"
        :key="modal.id + '_overlay'"
        :style="`z-index: ${1000 + index}`"
        class="vue-modals-overlay"
        :class="{ below: index < stack.length - 1, far: index < stack.length - 4 }"
        @click="modal.options.clickToClose !== false && close(modal)"
      />
      <component
        :is="modal.layout"
        :modal-id="modal.id"
        :modal="modal"
        :showClose="modal.options.showClose"
        :key="modal.id + '_modal'"
        class="vue-modals-layout"
        :style="`z-index: ${1001 + index}`"
        :stack="stack"
        :index="index"
        @close="close(modal, $event)"
        @destroy="destroy(modal, $event)"
        @answer="answer(modal, $event)"
      >
        <component
          :ref="modal.id"
          :is="modal.options.component"
          v-bind="modal.options.props"
          @close="close(modal, $event)"
          @destroy="destroy(modal, $event)"
          @answer="answer(modal, $event)"
        />
      </component>
    </template>
  </transition-group>
  <!-- </aside> -->
</template>

<script lang="ts">
import { VueConstructor } from 'vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Modals from './Modals';
import { Modal, ModalOptions } from './Types';

var globalId = 1;
const SymbolReject = Symbol('Reject');
const SymbolResolve = Symbol('Resolve');
const SymbolFulfilled = Symbol('Fulfilled');

@Component
export default class ModalStack extends Vue {
  @Prop({
    type: String,
    default: 'default'
  })
  readonly name: string;

  @Prop({
    type: String,
    default: 'drawer'
  })
  readonly layout: string;

  /**
   * List of modals in sequence. Last one is top most modal
   */
  stack: Modal[] = [];

  created() {
    // Register instance
    Modals.registerStack(this.name, this);
  }

  beforeDestroy() {
    // Unregister instance
    Modals.unregisterStack(this.name, this);
  }

  @Watch('name')
  onNameChanged(newName, oldName) {
    oldName && Modals.unregisterStack(oldName, this);
    newName && Modals.registerStack(newName, this);
  }

  /**
   * Removes a specific modal from the stack without
   * calling any hooks or notifying the modal
   */
  removeFromStack(modal: Modal) {
    const modalIndex = this.stack.findIndex(el => el === modal);
    if (modalIndex < 0) return;
    this.stack.splice(modalIndex, 1);
  }

  /**
   * Simply adds the modal to the stack
   */
  addToStack(modal: Modal) {
    this.stack.push(modal);
  }

  /**
   * Adds a new Modal to the stack
   */
  push(options: ModalOptions): Modal {
    const modal = this.buildModal(options);
    this.addToStack(modal);

    return modal;
  }

  /**
   * Closes the modal but can be prevented by the beforeClose hooks
   * on the component or modal options.
   */
  close(modal: Modal, error?: Error): boolean {
    if (!this.canClose(modal)) {
      return false;
    }

    this.destroy(modal, error);
    return true;
  }

  /**
   * Returns the correct component for the modal
   */
  layoutForModal(modal: Modal): string | Vue | VueConstructor<Vue> {
    const componentName = modal.layout ?? modal.options.layout ?? this.layout ?? 'section';
    if (typeof componentName === 'string') {
      const component = Vue.component(componentName);
      if (component) return component;
    }
    return componentName;
  }

  canClose(modal: Modal): boolean {
    const event = new Event('beforeClose', { cancelable: true });

    // Delegate to modal
    if (modal.options.beforeClose) {
      modal.options.beforeClose(event);
      if (event.defaultPrevented) {
        return false;
      }
    }

    // Delegate to view reference
    const vm = this.$refs[modal.id]?.[0];
    if (vm && typeof vm.beforeClose === 'function') {
      vm.beforeClose(event);
      if (event.defaultPrevented) {
        return false;
      }
    }

    // Check recursively if there are other modals that have this as parent and can't be closed
    if (!this.stack.filter(check => check.options.parent === vm).every(modal => this.canClose(modal))) {
      return false;
    }

    return true;
  }

  /**
   * Forcefully destroys a modal and closes it.
   * No option is given to keep it open with this call.
   */
  destroy(modal: Modal, error?: Error) {
    // Reject the modal promise
    if (!modal[SymbolFulfilled]) {
      modal[SymbolFulfilled] = true;
      modal[SymbolReject](error ?? new Error('Modal closed'));
    }

    this.removeFromStack(modal);
  }

  answer(modal: Modal, answer?: any) {
    // Resolve the modal promise
    if (!modal[SymbolFulfilled]) {
      modal[SymbolFulfilled] = true;
      modal[SymbolResolve](answer);
    }

    this.removeFromStack(modal);
  }

  pop(): Modal {
    if (this.stack.length) {
      const modal = this.stack[this.stack.length - 1];
      if (this.close(modal)) return modal;
    }

    return null;
  }

  popUntil(modal: Modal) {
    // Do not close modals if the modal is not present
    if (this.stack.findIndex(check => modal === check) < 0) return;
    while (this.stack.length > 0) {
      const check = this.pop();
      if (check === modal || check === null) {
        return;
      }
    }
  }

  /**
   * Closes all modals
   */
  clear() {
    while (this.stack.length) {
      this.destroy(this.stack[this.stack.length - 1]);
    }
  }

  buildModal(options: ModalOptions): Modal {
    let _resolve, _reject;
    const modal = new Promise<any>((resolve, reject) => {
      _resolve = resolve;
      _reject = val => ('default' in options ? resolve(options.default) : reject(val));
    }) as Modal;

    // Try to find out layout from component
    if (!options.layout && options.component?.layout) {
      options.layout = options.component.layout;
    }
    // modal.layoutComponent = Modals.layout(options.layout)

    // Listen to parent element destroy hook in order to destroy the modal too
    if (options.parent) {
      options.parent.$once('hook:beforeDestroy', () => this.destroy(modal, new Error('Component was destroyed')));
    }

    // Add bindings for future integrations
    modal.id = globalId++;
    modal.stack = this;
    modal.options = options;
    modal.layout = this.layoutForModal(modal);

    // Internal properties to track promise
    modal[SymbolReject] = _reject;
    modal[SymbolResolve] = _resolve;
    modal[SymbolFulfilled] = false;

    // Expose methods for closing and destroying modal
    modal.close = error => this.close(modal, error);
    modal.destroy = error => this.destroy(modal, error);

    return modal;
  }
}
</script>

<style lang="scss">
.vue-modals-layout {
  section {
    position: relative;
  }
}

.vue-modals-overlay {
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.502);
  opacity: 1;
  transition: opacity 0.5s linear, background-color 0.5s linear;

  &.below {
    background-color: rgba(0, 0, 0, 0.251);
  }
  &.far {
    opacity: 0;
  }

  &.modal-enter,
  &.modal-leave-to {
    opacity: 0;
  }
}
</style>
