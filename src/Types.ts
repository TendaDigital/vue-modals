import { Component, CreateComponentPublicInstance } from 'vue';
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
  parent?: Component | CreateComponentPublicInstance;

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

  /**
   * Indicates if the close button should be displayed
   */
  showClose?: boolean;

  width?: string;
  minWidth?: string;
  maxWidth?: string;

  height?: string;
  minHeight?: string;
  maxHeight?: string;

  hideOverlay?: boolean;
  clickToClose?: boolean;

  beforeClose?: (Event: any) => void;
}

export interface ModalResult {
  id: number;
  stack: typeof ModalStack;
  options: ModalOptions;
  /**
   * Component that will render the layout
   */
  layout: Component | CreateComponentPublicInstance | string;
  close(error?: any): void;
  destroy(error?: any): void;

  Reject: any;
  Resolve: any;
  Fulfilled: any;
}
export type Modal = Promise<any> & ModalResult;
