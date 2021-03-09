import { VueConstructor } from 'vue/types/umd';
import ModalStack from './ModalStack.vue';

export interface ModalOptions {
  /**
   * Name of the ModalStack to assign this Modal to.
   *
   * Uses the default stack or creates a new one by default
   */
  stack?: string;

  /**
   * Parent vue instance to watch for when being destroyed.
   *
   * If not set, will keep the dialog open even if the
   * component who created it was destroyed.
   */
  parent?: Vue;

  /**
   * The layout to use as container for the component
   */
  layout?: 'drawer' | 'window' | string;

  /**
   * Name or Class of the component to use inside the Modal
   */
  component: any;

  /**
   * Additional props to pass to the component.
   * Use this to assign custom parameters and inform the component
   * of important state when it's built.
   */
  props?: { [key: string]: any };

  /**
   * Default value for the result.
   *
   * If not assigned and the modal is closed, will throw an error.
   */
  default?: any;

  width?: string;
  minWidth?: string;
  maxWidth?: string;

  height?: string;
  minHeight?: string;
  maxHeight?: string;

  hideOverlay?: boolean;
  clickToClose?: boolean;

  beforeClose?: (Event) => void;
}

export interface ModalResult {
  id: number;
  stack: ModalStack;
  options: ModalOptions;
  /**
   * Component that will render the layout
   */
  layout: Vue | VueConstructor<Vue> | string;
  close(error?: any);
  destroy(error?: any);
}
export type Modal = Promise<any> & ModalResult;
