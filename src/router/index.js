import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/views/layout'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: '/',
                redirect: '/assets/office',
            },
            {
                path: '/assets/office',
                component: () => import('@/views/common/index.vue'),
            },
            {
                path: '/assets/college',
                component: () => import('@/views/common/index.vue'),
            },
            {
                path: '/assets/standard',
                component: () => import('@/views/common/index.vue'),
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

router.beforeEach((to, from, next) => {
    if (!store.getters.isLogin && to.path !== '/login') {
        next('/login')
        return
    }

    next()
})

export default router
