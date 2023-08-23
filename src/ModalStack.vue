<template>
  <!-- <aside class="vue-modals-stack" :name="name"> -->
  <transition-group tag="div" :stack="name" name="modal">
    <template v-for="(modal, index) in stack" :key="modal.id + '_modal'">
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

<script lang="ts" setup>
import { getCurrentInstance, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import Modals from './Modals';
import { Modal, ModalOptions } from './Types';

var globalId = 1;

const props = defineProps<{
  name: string;
  layout: string;
}>();

/**
 * List of modals in sequence. Last one is top most modal
 */
const stack = ref<Modal[]>([]);

const instance = getCurrentInstance();

onBeforeMount(() => {
  // Register instance
  Modals.registerStack(props.name, instance);
});

onBeforeUnmount(() => {
  // Unregister instance
  Modals.unregisterStack(props.name, instance);
});

watch(
  () => props.name,
  (newName: string, oldName: string) => {
    oldName && Modals.unregisterStack(oldName, instance);
    newName && Modals.registerStack(newName, instance);
  }
);

/**
 * Removes a specific modal from the stack without
 * calling any hooks or notifying the modal
 */
function removeFromStack(modal: Modal) {
  const modalIndex = stack.value.findIndex((el) => el === modal);
  if (modalIndex < 0) return;
  stack.value.splice(modalIndex, 1);
}

/**
 * Simply adds the modal to the stack
 */
function addToStack(modal: Modal) {
  stack.value.push(modal);
}

/**
 * Adds a new Modal to the stack
 */
export function push(options: ModalOptions): Modal {
  const modal = buildModal(options);
  addToStack(modal);

  return modal;
}

/**
 * Closes the modal but can be prevented by the beforeClose hooks
 * on the component or modal options.
 */
function close(modal: Modal, error?: Error): boolean {
  if (!canClose(modal)) {
    return false;
  }

  destroy(modal, error);
  return true;
}

/**
 * Returns the correct component for the modal
 */
export function layoutForModal(modal: Modal): any {
  const { layout } = props;
  const componentName = modal.layout ?? modal.options.layout ?? layout ?? 'section';
  if (typeof componentName === 'string') {
    const component = instance?.appContext.components[componentName];
    if (component) return component;
  }
  return componentName;
}

function canClose(modal: Modal): boolean {
  const event = new Event('beforeClose', { cancelable: true });

  // Delegate to modal
  if (modal.options.beforeClose) {
    modal.options.beforeClose(event);
    if (event.defaultPrevented) {
      return false;
    }
  }

  // Delegate to view reference
  // const vm = stack.value[modal.id];

  // if (vm && typeof vm.beforeClose === 'function') {
  //   vm.beforeClose(event);
  //   if (event.defaultPrevented) {
  //     return false;
  //   }
  // }

  // Check recursively if there are other modals that have this as parent and can't be closed
  if (!stack.value.filter((check) => check.options.parent === vm).every((modal) => canClose(modal))) {
    return false;
  }

  return true;
}

/**
 * Forcefully destroys a modal and closes it.
 * No option is given to keep it open with this call.
 */
function destroy(modal: Modal, error?: Error) {
  // Reject the modal promise
  if (!modal['Fulfilled']) {
    modal['Fulfilled'] = true;
    modal['Reject'](error ?? new Error('Modal closed'));
  }

  removeFromStack(modal);
}

function answer(modal: Modal, answer?: any) {
  // Resolve the modal promise
  if (!modal['Fulfilled']) {
    modal['Fulfilled'] = true;
    modal['Resolve'](answer);
  }

  removeFromStack(modal);
}

function pop(): Modal | null {
  if (stack.value.length) {
    const modal = stack.value[stack.value.length - 1];
    if (close(modal)) return modal;
  }

  return null;
}

export function popUntil(modal: Modal) {
  // Do not close modals if the modal is not present
  if (stack.value.findIndex((check) => modal === check) < 0) return;
  while (stack.value.length > 0) {
    const check = pop();
    if (check === modal || check === null) {
      return;
    }
  }
}

/**
 * Closes all modals
 */
export function clear() {
  while (stack.value.length) {
    destroy(stack.value[stack.value.length - 1]);
  }
}

function buildModal(options: ModalOptions): Modal {
  let _resolve, _reject;
  const modal = new Promise<any>((resolve, reject) => {
    _resolve = resolve;
    _reject = (val) => ('default' in options ? resolve(options.default) : reject(val));
  });

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
  modal['Reject'] = _reject;
  modal['Resolve'] = _resolve;
  modal['Fulfilled'] = false;

  // Expose methods for closing and destroying modal
  modal.close = (error) => this.close(modal, error);
  modal.destroy = (error) => this.destroy(modal, error);

  return modal;
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
