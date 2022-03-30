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
            >代表该角色尚未确认填报，绿色代表已确认，全部变为<span
                class="text-green-500"
            >
                绿色 </span
            >才可导出，点击角色可撤销该角色的提交
        </p>

        <div class="flex justify-end mt-[30px] pr-[50px]">
            <el-button
                type="primary"
                @click="handleExport"
                :disabled="!getAllIsInput()"
                >导出</el-button
            >
        </div>
    </el-card>
</template>

<script>
import { exportData } from '@/utils/compute'
import { clearInput, getAllIsInput, getIsInput } from '@/utils/storage'
import { VueOkrTree } from 'vue-okr-tree'
import 'vue-okr-tree/dist/vue-okr-tree.css'

export default {
    components: {
        VueOkrTree,
    },
    data() {
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
        renderLabelClass() {
            return (node) => {
                return getIsInput(node.data.id) === true
                    ? 'has-input'
                    : 'not-has-input'
            }
        },
    },

    methods: {
        getAllIsInput: getAllIsInput,
        async handleNodeClick(data) {
            await this.$confirm(`是否要撤销[${data.label}]的提交？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            })
            clearInput(data.id)
            this.$message.success(`[${data.label}]的提交已经撤销成功!`)
            this.$forceUpdate()
        },

        handleExport() {
            if (!getAllIsInput()) {
                this.$message.error('导出失败，不是所有角色都已确认填报')
                return
            }
            exportData()
            this.$message.success('导出成功')
        },

        renderContent(h, node) {
            return h()
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
