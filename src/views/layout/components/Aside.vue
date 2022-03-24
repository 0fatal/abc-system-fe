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
        <header class="text-white p-5 border-b border-slate-400">
            委培学院ABC系统
        </header>
        <el-menu-item index="/">
            <span slot="title">菜单1</span>
        </el-menu-item>
        <el-menu-item index="/publish">
            <span slot="title">菜单2</span>
        </el-menu-item>
        <el-menu-item index="/article">
            <span slot="title">菜单3</span>
        </el-menu-item>
        <el-menu-item index="/profile">
            <span slot="title">菜单4</span>
        </el-menu-item>
    </el-menu>
</template>

<script>
export default {
    methods: {
        handleOpen(key, keyPath) {
            console.log(key, keyPath)
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath)
        },
    },
}
</script>

<style>
.tac {
    height: 100%;
}
</style>
