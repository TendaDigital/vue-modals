/// <reference types="vite/client" />

import ModalStack from './ModalStack.vue';
import Modals from './Modals';

export {};
declare global {
  interface Window {
    GlobalStack: Map<string, typeof ModalStack>;
    Modals: Modals;
  }
}
