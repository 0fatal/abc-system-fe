<template>
    <el-card class="common-card">
        <div slot="header" class="header flex justify-between">
            <strong>{{ routeMap[$route.path] }}</strong>
            <el-button type="warning" size="mini" @click="handleImport"
                >一键导入</el-button
            >
            <input
                type="file"
                v-show="false"
                accept=".xlsx"
                ref="fileInput"
                @change="handleFile"
            />
        </div>
        <div class="flex justify-end operation">
            <el-button type="primary" size="mini" @click="handleConfirm"
                >确认并保存填写</el-button
            >
        </div>
        <el-form>
            <el-form-item>
                <strong class="text-[20px]">资源</strong>
                <strong class="text-[20px]">{{
                    $route.path === '/assets/standard'
                        ? '使用面积/数量'
                        : '费用'
                }}</strong>
            </el-form-item>
            <el-form-item v-for="item in form.items" :key="item.name">
                <el-select v-model="item.name">
                    <el-option
                        v-for="option in options"
                        :key="option"
                        :label="option"
                        :value="option"
                    ></el-option>
                </el-select>
                <el-input
                    class="w-[200px]"
                    v-model="item.value"
                    placeholder="请填写"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <el-button
                    @click="handlePlus"
                    type="primary"
                    circle
                    icon="el-icon-plus"
                >
                </el-button>
            </el-form-item>
        </el-form>
        <el-backtop target=".common-card"></el-backtop>
    </el-card>
</template>

<script>
import { parseXLSXFile } from '@/utils/myxlsx'
import { Route2MenuItemNameMap } from '@/role/role'
import { confirmInput } from '@/utils/storage'

// TODO 数据的created读取 getInput
// TODO 下拉框列表项的手动增加，可能需要localStorage存到本地？
// TODO 杭电背景图

export default {
    data() {
        return {
            routeMap: Route2MenuItemNameMap,
            options: [
                '房屋折旧',
                '设备折旧',
                '小电费',
                '办公费用',
                '教职工薪酬',
                '实验耗材',
                '活动经费',
                '共同体系统',
            ],
            form: {
                items: [
                    {
                        name: '房屋折旧',
                        value: null,
                    },
                    {
                        name: '设备折旧',
                        value: null,
                    },
                    {
                        name: '小电费',
                        value: null,
                    },
                    {
                        name: '办公费用',
                        value: null,
                    },
                    {
                        name: '教职工薪酬',
                        value: null,
                    },
                    {
                        name: '实验耗材',
                        value: null,
                    },
                    {
                        name: '活动经费',
                        value: null,
                    },
                    {
                        name: '共同体系统',
                        value: null,
                    },
                ],
            },
        }
    },
    methods: {
        handlePlus() {
            try {
                this.form.items.push({
                    name: '',
                    value: null,
                })
            } catch (e) {
                this.$message.error('请先完成上一个资源项的填写')
            }
        },
        handleImport() {
            this.$refs['fileInput'].click()
        },

        handleFile() {
            console.log(this.$refs.fileInput.files)
            const file = this.$refs.fileInput.files[0]
            console.log(file)
            parseXLSXFile(file)
        },

        handleConfirm() {
            confirmInput(
                this.$store.getters.getRole,
                this.$route.path,
                this.form
            )
            this.$message.success('保存成功！')
        },

        loadForm() {
            try {
                const data = getInput()
                this.form.items = data
            } catch (e) {}
        },
    },

    created() {},
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
