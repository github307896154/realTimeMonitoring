import Vue from 'vue'
import Router from 'vue-router'
import showMap from '@/components/showMap'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'showMap',
      component: showMap
    }
  ]
})
