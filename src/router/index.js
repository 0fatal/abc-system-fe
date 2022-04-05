import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/views/layout'
import store from '@/store'

Vue.use(VueRouter)

// 映射页面地址到对应的页面文件
const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '/',
                redirect: '/assets/export',
            },
            {
                path: '/assets/office',
                component: () => import('@/views/office/index.vue'),
            },
            {
                path: '/assets/college',
                component: () => import('@/views/college/index.vue'),
            },
            {
                path: '/assets/standard',
                component: () => import('@/views/standard/index.vue'),
            },
            {
                path: '/assets/export',
                component: () => import('@/views/export/index.vue'),
            },
        ],
    },
    {
        path: '/login',
        component: () => import('@/views/login/index.vue'),
    },
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
})

// 登录拦截，登录了才能继续操作
router.beforeEach((to, from, next) => {
    if (!store.getters.isLogin && to.path !== '/login') {
        next('/login')
        return
    }

    next()
})

export default router
