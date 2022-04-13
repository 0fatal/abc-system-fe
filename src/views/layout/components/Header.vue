<template>
    <div class="header">
        <el-select
            class="ml-10"
            size="mini"
            v-model="collegeValue"
            v-if="$store.getters.getRoleOrigin === 'admin'"
        >
            <el-option
                v-for="(option, idx) in collegeOptions"
                :label="option"
                :key="idx"
                :value="option"
            >
            </el-option>
        </el-select>
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
    data() {
        return {
            collegeOptions: [
                '卓越学院',
                '圣光机联合学院',
                '继续教育学院',
                '国际教育学院',
            ],
            collegeValue: '圣光机联合学院', // 默认学院
        }
    },
    methods: {
        async logout() {
            await this.$store.dispatch('logout')
            this.$router.push('/login')
        },
    },

    watch: {
        collegeValue(val) {
            if(val === '卓越学院') {
                if(process.env.NODE_ENV === "development") {
                    window.location.href = 'http://localhost:8080'
                } else {
                    window.location.href = 'https://v2.abc-system-fe.pages.dev'
                }
                
            }
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
    justify-content: space-between;
}

.info {
    margin-left: auto;
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
