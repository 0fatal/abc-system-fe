<template>
    <el-card class="common-card">
        <div slot="header" class="header flex justify-between">
            <strong>{{
                getRoleName($store.getters.getRole) +
                ' / ' +
                routeMap[$route.path]
            }}</strong>
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
        <div class="h-[50px]"></div>
        <el-table class="mx-[50px]" :data="tableData" v-if="$store.getters.getRoleOrigin === 'admin'" border style="width: 100%">
            <el-table-column
                fixed
                prop="type"
                label=""
                width="150">
            </el-table-column>
            <el-table-column
                fixed
                prop="学生管理"
                label="学生管理"
                width="150">
                    <template slot-scope="scope">
                        <el-input v-model="tableData[scope.$index]['学生管理']"></el-input>
                    </template>
                </el-table-column>
                <el-table-column
                fixed
                prop="党团建设"
                label="党团建设"
                width="150">
                 <template slot-scope="scope">
                        <el-input v-model="tableData[scope.$index]['党团建设']"></el-input>
                    </template>
                    </el-table-column>
                <el-table-column
                fixed
                prop="社团管理"
                label="社团管理"
                width="150">
                 <template slot-scope="scope">
                        <el-input v-model="tableData[scope.$index]['社团管理']"></el-input>
                    </template></el-table-column>
                <el-table-column
                fixed
                prop="科研竞赛"
                label="科研竞赛"
                width="150">
                 <template slot-scope="scope">
                        <el-input v-model="tableData[scope.$index]['科研竞赛']"></el-input>
                    </template></el-table-column>
                <el-table-column
                fixed
                prop="思政课程教学"
                label="思政课程教学"
                width="150">
                 <template slot-scope="scope">
                        <el-input v-model="tableData[scope.$index]['思政课程教学']"></el-input>
                    </template></el-table-column>
        </el-table>
        <el-backtop target=".common-card"></el-backtop>
    </el-card>
</template>

<script>
import { getRoleName, Route2MenuItemNameMap } from '@/role/role'
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
            tableData: [
                {
                    type: '学工办整体',
                    学生管理: 2,
                    党团建设: 1,
                    社团管理: 1,
                    科研竞赛: 1,
                    思政课程教学: 1,
                },
                {
                    type: '赵老师',
                    学生管理: 2,
                    党团建设: 0,
                    社团管理: 0,
                    科研竞赛: 1,
                    思政课程教学: 0,
                },
                {
                    type: '周老师',
                    学生管理: 2,
                    党团建设: 0,
                    社团管理: 1,
                    科研竞赛: 0,
                    思政课程教学: 0,
                },
                {
                    type: '何老师',
                    学生管理: 2,
                    党团建设: 1,
                    社团管理: 0,
                    科研竞赛: 0,
                    思政课程教学: 0,
                }
            ]
        }
    },
    methods: {
        getRoleName: getRoleName,
        // 确认并保存填写
        handleConfirm() {
            confirmInput(
                this.$store.getters.getRole,
                this.$route.path,
                this.form.standardItems,
                this.tableData
            )
            this.$message.success('保存成功！')
        },
    },

    // watch: {},

    // 页面创建时载入上次填写的
    created() {
        this.$store.getters.getRole
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
