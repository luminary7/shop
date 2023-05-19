import Vue from 'vue'
import VueRouter from 'vue-router'

import Login from '../components/login.vue'
import Home from '../components/home.vue';

Vue.use(VueRouter)

const routes = [
  {
    path : '/',
    redirect : '/login'
  },
  {
    path : '/login',
    component : Login
  },
  {
    path : '/home',
    component : Home,
    redirect : '/welcome',
    children :[
      {path : '/welcome',component: () => import("../components/index/welcome.vue")},
      {path : '/users',component: () => import("../components/user/users.vue")},
      {path : '/rights',component: () => import("../components/power/rights.vue")},
      {path : '/roles',component: () => import("../components/power/roles.vue")},
      {path : '/goods',component: () => import("../components/goods/goods.vue")},
      {path : '/goods/add',component: () => import("../components/goods/add.vue")},
      {path : '/goods/edit',component: () => import("../components/goods/edit.vue")},
      {path : '/categories',component: () => import("../components/goods/categories.vue")},
      {path : '/params',component: () => import("../components/goods/params.vue")},
      {path : '/orders',component: () => import("../components/order/orders.vue")},
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach( (to,from,next) =>{
  // 访问登录则直接放行
  if(to.path === "/login") {
    return next()
  }

  // 未能登录 转跳至/login
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  if(!userInfo) {
    return next("/login")
  }
  // 已经登录 直接放行
  next()
} )
export default router
