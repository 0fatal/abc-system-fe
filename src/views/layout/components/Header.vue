<template>
    <div class="header">
        <div class="info">
            <div class="nickname">你好，{{ $store.getters.nickname }}</div>
            <el-dropdown size="medium" @command="logout">
                <span class="el-dropdown-link">
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="logout"
                        >退出登录</el-dropdown-item
                    >
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Header',
    methods: {
        async logout() {
            await this.$store.dispatch('logout')
            this.$router.push('/login')
        },
    },
}
</script>

<style>
.header {
    background: #fff;
    width: 100%;
    padding: 0;
    height: 100%;
    display: flex;
    align-items: center;
}

.info {
    margin-left: auto;
    justify-self: flex-end;
    display: flex;
    align-items: center;
    margin-right: 30px;
}

.avatar {
    margin-right: 30px;
}

.el-dropdown-link {
    cursor: pointer;
    color: #409eff;
}
.el-icon-arrow-down {
    font-size: 12px;
}
</style>
