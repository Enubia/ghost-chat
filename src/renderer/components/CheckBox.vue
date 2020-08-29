<template>
  <label class="flex justify-start items-start" @change="$emit('change', isChecked)">
    <div
      class="bg-white border-2 rounded border-gray-400 w-6 h-6 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-blue-500"
    >
      <input
        type="checkbox"
        class="opacity-0 absolute"
        :checked="checked"
        @change="setChecked($event.target.checked)"
      />
      <svg
        class="fill-current hidden w-4 h-4 text-green-500 pointer-events-none"
        viewBox="0 0 20 20"
      >
        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
      </svg>
    </div>
    <div class="select-none text-2xl -mt-1">{{ labelText }}</div>
  </label>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'CheckBox',
})
export default class CheckBox extends Vue {
  @Prop(String) readonly labelText: string;

  @Prop(Boolean) readonly checked: boolean;

  isChecked = false;

  setChecked(value) {
    this.isChecked = value;
  }
}
</script>

<style scoped lang="scss">
input:checked + svg {
  display: block;
}
</style>
