<template>
    <el-menu
        class="menu"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        :default-active="$route.fullPath"
        router
    >
        <header class="text-yellow-300 p-5">圣光联合学院ABC系统</header>
        <el-submenu index="1">
            <template slot="title">
                <i class="el-icon-location"></i>
                <span slot="title">院长</span>
            </template>
            <el-menu-item index="/assets/college?role=president"
                >学院资源</el-menu-item
            >
            <el-menu-item index="/assets/office?role=president"
                >人员费用</el-menu-item
            >
            <el-menu-item index="/assets/standard?role=president"
                >资源动因</el-menu-item
            >
            <el-menu-item index="/assets/export?role=president"
                >报表导出</el-menu-item
            >
        </el-submenu>
        <el-submenu index="2">
            <template slot="title">
                <i class="el-icon-location"></i>
                <span slot="title">学院办</span>
            </template>

            <el-menu-item index="/assets/office?role=collegeDirector"
                >人员费用</el-menu-item
            >
            <el-menu-item index="/assets/standard?role=collegeDirector"
                >资源动因</el-menu-item
            >
        </el-submenu>
        <el-submenu index="3">
            <template slot="title">
                <i class="el-icon-location"></i>
                <span slot="title">教科办</span>
            </template>

            <el-menu-item index="/assets/office?role=studyDirector"
                >人员费用</el-menu-item
            >
            <el-menu-item index="/assets/standard?role=studyDirector"
                >资源动因</el-menu-item
            >
        </el-submenu>
        <el-submenu index="4">
            <template slot="title">
                <i class="el-icon-location"></i>
                <span slot="title">学工办</span>
            </template>

            <el-menu-item index="/assets/office?role=staffDirector"
                >人员费用</el-menu-item
            >
            <el-menu-item index="/assets/standard?role=staffDirector"
                >资源动因</el-menu-item
            >
        </el-submenu>
    </el-menu>
</template>

<script>
export default {
    data() {
        return {}
    },
    methods: {},

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
