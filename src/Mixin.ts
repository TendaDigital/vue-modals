import { ModalOptions } from './Types'
import Modals from './Modals'

const $Modals = Symbol('Modals')

export default {
  beforeDestroy: function () {
    this[$Modals] && this[$Modals].map(d => d.close(new Error('Parent component was destroyed')))
    delete this[$Modals]
  },

  methods: {
    $modal(options: ModalOptions) {
      let modal = Modals.open(options)
      this[$Modals] = this[$Modals] ?? []
      this[$Modals].push(modal)
      const clearModal = () => {
        if (!this[$Modals]) return
        let index = this[$Modals].findIndex(modal)
        if (index < 0) return
        this[$Modals].splice(index, 1)
      }
      modal.then(clearModal).catch(clearModal)
    },
  }
}