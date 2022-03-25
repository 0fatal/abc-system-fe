<template>
    <el-menu
        class="menu"
        @open="handleOpen"
        @close="handleClose"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        :default-active="$route.path"
        router
    >
        <header class="text-yellow-300 p-5">委培学院ABC系统</header>
        <el-menu-item
            v-for="route in $store.getters.getRoutes"
            :key="route"
            :index="route"
        >
            <span slot="title">{{ routeMap[route] }}</span>
        </el-menu-item>
    </el-menu>
</template>

<script>
import { Route2MenuItemNameMap } from '@/role/role'
export default {
    data() {
        return {
            routeMap: Route2MenuItemNameMap,
        }
    },
    methods: {
        handleOpen(key, keyPath) {
            console.log(key, keyPath)
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath)
        },
    },

    mounted() {},
}
</script>

<style>
.tac {
    height: 100%;
}
.menu > header {
    border-bottom: 1px solid #999;
}
</style>
