import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    channelName: '',
  },
  mutations: {
    setChannelName(state, payload) {
      state.channelName = payload;
    },
  },
  plugins: [],
  strict: process.env.NODE_ENV !== 'production',
});
