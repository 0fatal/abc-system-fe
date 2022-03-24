<template>
    <el-card>
        <div slot="header" class="header flex justify-between">
            计算
            <el-button type="warning" size="mini">一键导入</el-button>
        </div>
        <el-form>
            <el-form-item>
                <el-label>资源</el-label>
                <el-label>费用</el-label>
            </el-form-item>
            <el-form-item v-for="item in form.items" :key="item.name">
                <el-select></el-select>
                <el-input class="w-[200px]"></el-input>
            </el-form-item>
            <el-form-item>
                <el-label></el-label>
                <el-label></el-label>
                <el-label></el-label>
                <el-label></el-label>
                <el-label></el-label>
                <el-label></el-label>
                <el-label></el-label>
                <el-button
                    @click="handlePlus"
                    type="primary"
                    circle
                    icon="el-icon-plus"
                >
                </el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script>
export default {
    data() {
        return {
            form: {
                items: [
                    {
                        name: '资源',
                        value: null,
                    },
                ],
            },
        }
    },
    methods: {
        handlePlus() {
            this.form.items.push({
                name: '资源2',
                value: null,
            })
        },
    },
}
</script>

<style>
.el-form-item__content {
    @apply flex justify-between;
}
</style>
