import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  routes: [
    {
      name: 'version',
      path: '/',
      component: () => import('./pages/ReleaseCheck.vue'),
      meta: {},
    },
    {
      name: 'index',
      path: '/index',
      component: () => import('./pages/Index.vue'),
      meta: {},
    },
    {
      name: 'chat',
      path: '/chat',
      component: () => import('./pages/Chat.vue'),
      meta: {},
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});

export default router;
