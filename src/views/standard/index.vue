<template>
    <el-card class="common-card">
        <div slot="header" class="header flex justify-between">
            <strong>{{ routeMap[$route.path] }}</strong>
        </div>
        <div class="flex justify-end operation">
            <el-button type="primary" size="mini" @click="handleConfirm"
                >确认并保存填写</el-button
            >
        </div>
        <el-form>
            <el-form-item>
                <strong class="text-[20px]">资源</strong>
                <strong class="text-[20px]"> 使用面积/数量 </strong>
            </el-form-item>

            <el-form-item
                v-for="(item, index) in form.standardItems"
                :key="item.name"
                size="mini"
            >
                <el-select v-model="item.name" disabled>
                    <el-option
                        v-for="option in options"
                        :key="option"
                        :label="option"
                        :value="option"
                    ></el-option>
                </el-select>
                <el-input
                    type="number"
                    class="w-[200px]"
                    v-model="form.standardItems[index].value"
                    placeholder="请填写"
                ></el-input>
            </el-form-item>
        </el-form>
        <el-backtop target=".common-card"></el-backtop>
    </el-card>
</template>

<script>
import { Route2MenuItemNameMap } from '@/role/role'
import { confirmInput } from '@/utils/storage'

export default {
    data() {
        return {
            routeMap: Route2MenuItemNameMap,
            options: [], // 下拉框的选项
            form: {
                // 保存每个下拉框值的变量
                standardItems: [],
            },
        }
    },
    methods: {
        // 确认并保存填写
        handleConfirm() {
            confirmInput(
                this.$store.getters.getRole,
                this.$route.path,
                this.form.standardItems
            )
            this.$message.success('保存成功！')
        },
    },

    // 页面创建时载入上次填写的
    created() {
        this.form.standardItems = this.$store.getters.getStandardItems
    },

    // 页面关闭前保存填写到缓存，但不保存到本地
    beforeDestroy() {
        this.$store.commit('setStandardItems', this.form.standardItems)
    },
}
</script>

<style>
.el-form-item__content {
    @apply flex justify-between;
}

.operation {
    border-bottom: 1px solid #e6e6e6;
    padding-bottom: 20px;
    margin-bottom: 20px;
}
</style>
