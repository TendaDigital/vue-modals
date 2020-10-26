<template>
  <!-- <aside class="lay-modal-stack" :name="name"> -->
    <transition-group
      tag="aside"
      class="lay-stack"
      name="modal">
      <template v-for="(modal, index) in stack">
        <div
          v-if="!modal.options.hideOverlay"
          :key="modal.id + '_overlay'"
          :layout="modal.options.layout || 'drawer'"
          :id="modal.id"
          :class="{'lay-overlay': true, above: index == stack.length - 1, below: index < stack.length - 1}"
          @click="modal.options.clickToClose !== false && close(modal)"/>
        <section
          :key="modal.id + '_modal'"
          :layout="modal.options.layout || 'drawer'"
          :id="modal.id"
          :class="{'lay-modal': true, above: index == stack.length - 1, below: index < stack.length - 1}"
          :style="{'--index': index, '--depth': stack.length - index - 1}">
          <component
            :ref="modal.id"
            :is="modal.options.component"
            v-bind="modal.options.props"
            @close="close(modal, $event)"
            @answer="answer(modal, $event)"/>
        </section>
      </template>
    </transition-group>
  <!-- </aside> -->
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Modals from './Modals';
import { Modal, ModalOptions } from './Types'

var globalId = 1
const SymbolReject = Symbol('Reject')
const SymbolResolve = Symbol('Resolve')
const SymbolFulfilled = Symbol('Fulfilled')

@Component
export default class ModalStack extends Vue {
  @Prop({
    type: String,
    default: 'default',
  })
  readonly name: string;

  /**
   * List of modals in sequence. Last one is top most modal
   */
  stack: Modal[] = []

  created() {
    // Register instance
    Modals.register(this.name, this)
  }

  beforeDestroy() {
    // Unregister instance
    Modals.unregister(this.name, this)
  }

  @Watch('name')
  onNameChanged(newName, oldName) {
    oldName && Modals.unregister(oldName, this)
    newName && Modals.register(newName, this)
  }

  /**
   * Removes a specific modal from the stack without
   * calling any hooks or notifying the modal
   */
  removeFromStack(modal: Modal) {
    let modalIndex = this.stack.findIndex(el => el == modal)
    if (modalIndex < 0) return;
    this.stack.splice(modalIndex, 1)
  }

  /**
   * Simply adds the modal to the stack
   */
  addToStack(modal: Modal) {
    this.stack.push(modal)
  }

  /**
   * Adds a new Modal to the stack
   */
  push(options: ModalOptions): Modal {
    let modal = this.buildModal(options)
    this.addToStack(modal)

    return modal
  }

  /**
   * Closes the modal but can be prevented by the beforeClose hooks
   * on the component or modal options.
   */
  close(modal: Modal, error?: Error): boolean {
    if (!this.canClose(modal)) {
      return false
    }

    this.destroy(modal, error)
    return true
  }

  canClose(modal: Modal): boolean {
    let event = new Event('beforeClose', {cancelable: true})
    
    // Delegate to modal
    if (modal.options.beforeClose) {
      modal.options.beforeClose(event)
      if (event.defaultPrevented) {
        return false
      }
    }

    // Delegate to view reference
    const vm = this.$refs[modal.id]?.[0]
    if (vm && (typeof vm['beforeClose']) === 'function') {
      vm['beforeClose'](event)
      if (event.defaultPrevented) {
        return false
      }
    }

    // Check recursively if there are other modals that have this as parent and can't be closed
    if (!this.stack.filter(check => check.options.parent == vm).every(modal => this.canClose(modal))) {
      return false
    }

    return true
  }

  /**
   * Forcefully destroys a modal and closes it. 
   * No option is given to keep it open with this call.
   */
  destroy(modal: Modal, error?: Error) {
    // Reject the modal promise
    if (!modal[SymbolFulfilled]) {
      modal[SymbolFulfilled] = true
      modal[SymbolReject](error ?? new Error('Modal closed'))
    }

    this.removeFromStack(modal)
  }

  answer(modal: Modal, answer?: any) {
    // Resolve the modal promise
    if (!modal[SymbolFulfilled]) {
      modal[SymbolFulfilled] = true
      modal[SymbolResolve](answer)
    }

    this.removeFromStack(modal)
  }

  pop(): Modal {
    if (this.stack.length) {
      let modal = this.stack[this.stack.length - 1]
      if (this.close(modal))
        return modal
    }

    return null
  }

  popUntil(modal: Modal) {
    // Do not close modals if the modal is not present
    if (this.stack.findIndex(check => modal == check) < 0) return
    while (this.stack.length > 0) {
      let check = this.pop()
      if (check === modal || check === null) {
        return
      }
    }
  }

  /**
   * Closes all modals
   */
  clear() {
    while (this.stack.length) {
      this.destroy(this.stack[this.stack.length - 1])
    }
  }

  buildModal(options: ModalOptions): Modal {
    let resolve, reject
    const modal = new Promise<any>((_resolve, _reject) => {
      resolve = _resolve
      reject = (val) => 'default' in options ? _resolve(options.default) : _reject(val)
    }) as Modal

    // Try to find out layout from component
    if (!options.layout && options.component?.layout) {
      options.layout = options.component.layout
    }

    // Listen to parent element destroy hook
    if (options.parent) {
      options.parent.$once('hook:beforeDestroy', () => this.destroy(modal, new Error('Component was destroyed')))
    }

    modal.id = globalId++
    modal.stack = this
    modal.options = options
    modal[SymbolReject] = reject
    modal[SymbolResolve] = resolve
    modal[SymbolFulfilled] = false
    modal.close = (error) => this.close(modal, error)
    modal.destroy = (error) => this.destroy(modal, error)
    
    return modal
  }
}
</script>

<style lang="scss">
.lay-modal
{
  section {
    position: relative;
  }
}

.lay-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.3);
  opacity: 1;
  transition: opacity 0.5s linear;
  // &.modal-enter-active, &.modal-leave-active {
  // }

  &.below {
    opacity: 0.5;
  }

  &.modal-enter, &.modal-leave-to {
    opacity: 0;
  }
}

.lay-modal[layout=drawer] {
  background: white;
  // box-shadow: 0 4px 16px rgba(0,0,0,0.3);

  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  overflow: auto;

  transition: opacity .5s, transform .5s ease-in-out;
  transform: translateX(calc(100vw - 100%));

  &.below {
    transform: translateX(max(0px,calc(100vw - 100% - 100px * var(--depth) )));
  }

  &.modal-enter, &.modal-leave-to {
    transform: translateX(calc(100vw));
  }
}
</style>