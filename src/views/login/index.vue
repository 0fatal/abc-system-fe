<template>
    <div
        class="page-login flex justify-center items-center bg-blue-200 w-screen h-screen"
    >
        <el-card class="w-[400px] mt-[50px] h-[300px]">
            <div slot="header">
                <span>登录</span>
            </div>
            <div>
                <el-form
                    label-width="80px"
                    :model="form"
                    :rules="rules"
                    ref="form"
                >
                    <el-form-item label="用户名" prop="username">
                        <el-input
                            v-model="form.username"
                            placeholder="请输入用户名"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input
                            type="password"
                            v-model="form.password"
                            placeholder="请输入密码"
                        ></el-input>
                    </el-form-item>
                    <el-button
                        class="text-black w-[200px]"
                        type="primary"
                        @click="handleLogin"
                        >登录</el-button
                    >
                </el-form>
            </div>
        </el-card>
    </div>
</template>

<script>
export default {
    name: 'Login',
    data() {
        return {
            form: {
                // 默认填在页面上的账号密码，可以改
                username: 'p000',
                password: '123456',
            },
            rules: {
                username: [
                    {
                        required: true,
                        message: '请输入用户名',
                        trigger: 'blur',
                    },
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                ],
            },
        }
    },

    methods: {
        handleLogin() {
            // 表单验证，就是账号密码非空啊这些
            this.$refs.form.validate(async (valid) => {
                if (valid) {
                    // 如果验证有效
                    const res = await this.$store.dispatch('login', {
                        username: this.form.username,
                        password: this.form.password,
                    })
                    if (res) {
                        this.$message.success('登录成功')
                        this.$router.push('/')
                    } else {
                        this.$message.error('登录失败，账号或密码错误')
                    }
                }
            })
        },
    },
}
</script>

<style>
.page-login {
    background-image: url('@/assets/bg.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
}
</style>
