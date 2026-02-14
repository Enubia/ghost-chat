<script lang="ts" setup>
import {reactive} from 'vue'
import {Greet, GetAppInfo, SendTestEvent} from '../../wailsjs/go/main/App'
import {EventsOn, EventsEmit} from '../../wailsjs/runtime/runtime'

const data = reactive({
  name: "",
  resultText: "Please enter your name below 👇",
})

const appInfo = reactive({
  info: "",
});

const helloEvent = reactive({
  message: "",
})

function greet() {
  Greet(data.name).then(result => {
    data.resultText = result
  })
}

function getAppInfo() {
  GetAppInfo().then(result => {
    appInfo.info = result
  })
}

EventsOn("test:hello", (message) => {
  helloEvent.message = message
})

function emitTestEvent() {
  EventsEmit("test:from-frontend", "Hello from Vue!")
}

</script>

<template>
  <main>
    <button class="btn" @click="emitTestEvent">Emit Test Event</button>
    <button class="btn" @click="getAppInfo">Get App Info</button>
    <div id="app-info" class="result">{{ appInfo.info }}</div>
    <button class="btn" @click="SendTestEvent">Send Test Event</button>
    <div id="hello-event" class="result">{{ helloEvent.message }}</div>
    <div id="result" class="result">{{ data.resultText }}</div>
    <div id="input" class="input-box">
      <input id="name" v-model="data.name" autocomplete="off" class="input" type="text"/>
      <button class="btn" @click="greet">Greet</button>
    </div>
  </main>
</template>

<style scoped>
.result {
  height: 20px;
  line-height: 20px;
  margin: 1.5rem auto;
}

.input-box .btn {
  width: 60px;
  height: 30px;
  line-height: 30px;
  border-radius: 3px;
  border: none;
  margin: 0 0 0 20px;
  padding: 0 8px;
  cursor: pointer;
}

.input-box .btn:hover {
  background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
  color: #333333;
}

.input-box .input {
  border: none;
  border-radius: 3px;
  outline: none;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  background-color: rgba(240, 240, 240, 1);
  -webkit-font-smoothing: antialiased;
}

.input-box .input:hover {
  border: none;
  background-color: rgba(255, 255, 255, 1);
}

.input-box .input:focus {
  border: none;
  background-color: rgba(255, 255, 255, 1);
}
</style>
