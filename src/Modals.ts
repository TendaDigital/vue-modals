import ModalStack from './ModalStack.vue';
import { createApp, App, DefineComponent } from 'vue';
import { ModalOptions } from './Types';

const globalStackInstancesKey = 'GlobalStack';

export default class Modals {
  static globalStackInstances =
    window[globalStackInstancesKey] || (window[globalStackInstancesKey] = new Map<string, typeof ModalStack>());

  /**
   * Creates a stack instance with the given name
   */
  static createStackInstance(name: string): typeof ModalStack {
    console.warn(
      `[VueModals] No ModalStack was found for name "${name}". Using Modals without a stack instance causes one to be created as default at the end of the document body.`
    );
    const rootElement = document.createElement('aside');
    document.body.insertAdjacentElement('beforeend', rootElement);
    const app = createApp({
      render: (h: any) => h(ModalStack),
      props: { name },
    });

    app.mount(rootElement);

    const stack = this.globalStackInstances.get(name);

    if (!stack) {
      throw new Error();
    }

    return stack;
  }

  /**
   * Returns the stack modal instance by name.
   * If default instance is requested and is not registered,
   * it creates one and returns.
   */
  static stack(name: string = 'default'): typeof ModalStack {
    // Create instance if no default one exists
    if (name === 'default' && !this.globalStackInstances.has('default')) {
      return this.createStackInstance('default');
    }
    if (this.globalStackInstances.has(name)) {
      return this.globalStackInstances.get(name);
    }
    throw new Error(
      `[VueModals] No stack instance found for name "${
        name ?? 'default'
      }". Create a ModalStack instance with this name to use it`
    );
  }

  static async open(options: ModalOptions) {
    await (this.stack(options.stack) as typeof ModalStack).push(options);
  }

  static registerLayout(app: App, name: string, layout: DefineComponent) {
    app.component(name, layout);
  }

  static registerStack(name: string, stack: any) {
    console.warn('register', name, stack);
    if (this.globalStackInstances.has(name)) {
      console.warn(
        `[VueModals] Multiple instances of ModalStack must have unique names. Duplicate name found for ModalStack "${name}".`
      );
    } else {
      this.globalStackInstances.set(name, stack);
    }
  }

  static unregisterStack(name: string, stack: any) {
    console.warn('unregister', name, stack);
    if (this.globalStackInstances.get(name) === stack) {
      this.globalStackInstances.delete(this.name);
    } else {
      console.warn(`[VueModals] Could not unregister ModalStack because a duplicate name was found "${name}".`);
    }
  }
}

window.Modals = Modals;
