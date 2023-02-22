<template lang="pug">
  #loading-wrapper
    #loading-text {{ loadingText }}
    #loading-content
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  name: 'Loading',
})
export default class Loading extends Vue {
  @Prop(String) readonly loadingText: string;
}
</script>

<style scoped lang="scss">
#loading-wrapper {
  position: fixed;
  width: 100%;
  height: 95%;
  left: 0;
  top: 0;

  #loading-text {
    display: block;
    position: absolute;
    top: 45%;
    left: 49%;
    color: white;
    width: 100px;
    height: 30px;
    margin: -7px 0 0 -45px;
    text-align: center;
    font-family: 'PT Sans Narrow', sans-serif;
    font-size: 18px;
  }

  #loading-content {
    display: block;
    position: relative;
    left: 50%;
    top: 50%;
    width: 170px;
    height: 170px;
    margin: -85px 0 0 -85px;
    border: 3px solid transparent;
    border-top-color: #8d41e6;
    border-bottom-color: #8d41e6;
    border-radius: 50%;
    -webkit-animation: loader 2s linear infinite;
    -moz-animation: loader 2s linear infinite;
    -o-animation: loader 2s linear infinite;
    animation: loader 2s linear infinite;
  }

  @keyframes loader {
    0% {
      -webkit-transform: rotate(0deg);
      -ms-transform: rotate(0deg);
      transform: rotate(0deg);
    }

    100% {
      -webkit-transform: rotate(360deg);
      -ms-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
}
</style>
