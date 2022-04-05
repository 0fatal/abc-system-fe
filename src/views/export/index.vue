<template>
    <el-card>
        <div slot="header" class="flex">
            <strong>数据导出</strong>
        </div>
        <div class="flex justify-center pl-[100px]">
            <vue-okr-tree
                :data="testData"
                direction="horizontal"
                :label-class-name="renderLabelClass"
                @node-click="handleNodeClick"
            ></vue-okr-tree>
        </div>
        <p
            class="text-left ml-[100px] mt-[30px] text-sm text-gray-500 underline underline-offset-2"
        >
            Tips:
            <span class="text-red-400"> 红色 </span
            >代表尚未确认填报，绿色代表已确认，全部变为<span
                class="text-green-500"
            >
                绿色 </span
            >才可导出{{
                $store.getters.getRoleOrigin === 'admin'
                    ? '，点击角色可撤销该角色的提交'
                    : ''
            }}
        </p>

        <div class="flex justify-end mt-[30px] pr-[50px]">
            <div class="space-y-2">
                <el-button
                    type="primary"
                    @click="handleExport"
                    :disabled="!getAllIsInput()"
                    >导出详细汇总表</el-button
                >
                <el-button
                    type="primary"
                    @click="handleExport1"
                    :disabled="!getAllIsInput()"
                    >导出作业成本归集表</el-button
                >
                <el-button
                    type="primary"
                    @click="handleExport2"
                    :disabled="!getAllIsInput()"
                    >导出培养成本表</el-button
                >
            </div>
        </div>
    </el-card>
</template>

<script>
import { exportData, exportData1, exportData2 } from '@/utils/compute'
import { clearInput, getAllIsInput, getIsInput } from '@/utils/storage'
import { VueOkrTree } from 'vue-okr-tree'
import 'vue-okr-tree/dist/vue-okr-tree.css'

export default {
    components: {
        VueOkrTree,
    },
    data() {
        // 这个是 组织 树，就是树形图对应的每个节点
        return {
            testData: [
                {
                    id: 'president',
                    label: '院长',
                    children: [
                        {
                            id: 'collegeDirector',
                            label: '学院办主任',
                            children: [
                                {
                                    id: 'staffDirector',
                                    label: '学工办主任',
                                },
                                {
                                    id: 'studyDirector',
                                    label: '教科版主任',
                                },
                            ],
                        },
                    ],
                },
            ],
        }
    },
    computed: {
        // 这个用来渲染树形图节点的样式
        renderLabelClass() {
            return (node) => {
                return getIsInput(node.data.id) === true
                    ? 'has-input'
                    : 'not-has-input'
            }
        },
    },

    methods: {
        // 函数：确认所有角色是否都完成填写
        getAllIsInput: getAllIsInput,

        // 函数：撤销填写
        async handleNodeClick(data) {
            if (this.$store.getters.getRoleOrigin !== 'admin') {
                return
            }
            await this.$confirm(`是否要撤销[${data.label}]的提交？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            })
            clearInput(data.id)
            this.$message.success(`[${data.label}]的提交已经撤销成功!`)
            this.$forceUpdate()
        },

        // 函数：导出
        handleExport() {
            if (!getAllIsInput()) {
                this.$message.error('导出失败，不是所有角色都已确认填报')
                return
            }
            exportData()
            this.$message.success('导出成功')
        },
        handleExport1() {
            if (!getAllIsInput()) {
                this.$message.error('导出失败，不是所有角色都已确认填报')
                return
            }
            exportData1()
            this.$message.success('导出成功')
        },
        handleExport2() {
            if (!getAllIsInput()) {
                this.$message.error('导出失败，不是所有角色都已确认填报')
                return
            }
            exportData2()
            this.$message.success('导出成功')
        },
    },
}
</script>

<style>
.has-input {
    color: white;
    border-radius: 7px;
    background-color: green;
    border: 1px solid #ccc;
}

.not-has-input {
    color: white;
    border-radius: 7px;

    background-color: rgb(255, 0, 140);
    border: 1px solid #fff;
}
</style>
