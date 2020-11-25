<template>
  <div :style="{width: `${width}px`}">
    <div style="position: sticky; top: 0; z-index: 1; background: white;">
      This is a demo modal component.<br/>
      <button @click="$emit('close')">× Close</button>
      <button @click="$emit('answer', 'Apple')">Return "Apple"</button>
      <button @click="$emit('answer', 'Banana')">Return "Banana"</button>
      <p><input type="checkbox" v-model="preventClosingFlag"/> Prevent closing?</p>
      <button @click="open()">Open nested</button>
      <pre>Props = {{JSON.stringify($attrs, null, 2)}}</pre>
    </div>
    <ul>
      <li v-for="i in 200" :key="i">Line #{{i}}</li>
    </ul>
  </div>
</template>

<script>
import Modals from '@/Modals'
export default {
  name: 'DemoModal',
  props: {
    width: {
      type: Number,
      default: 500,
    }
  },
  data() {
    return {
      preventClosingFlag: false,
    }
  },
  methods: {
    async beforeClose(event) {
      if (this.preventClosingFlag) {
        event.preventDefault()
        if (await Modals.open({layout: 'drawer', component: 'DemoModal', parent: this}) == "Banana") {
          this.$emit('destroy')
        }
      }
    },

    open() {
      Modals.open({layout: 'drawer', component: 'DemoModal', default: null, parent: this})
    }
  }
}
</script>