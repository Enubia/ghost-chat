<template>
  <div class="slidecontainer">
    <label for="myRange"></label>
    <input
      id="myRange"
      type="range"
      :min="min"
      :step="step"
      :max="max"
      :value="initialValue"
      class="slider"
      @input="$emit('newValue', $event.target.value)"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'Slider',
})
export default class Slider extends Vue {
  @Prop(String) readonly initialValue: string;

  @Prop(String) readonly min: string;

  @Prop(String) readonly max: string;

  @Prop(String) readonly step: string;
}
</script>

<style scoped lang="scss">
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 15px;
  border-radius: 5px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #f9fb03;
    cursor: pointer;
  }
}
</style>
