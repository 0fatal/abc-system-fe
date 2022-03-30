<template>
    <el-card class="common-card">
        <div slot="header" class="header flex justify-between">
            <strong>{{ routeMap[$route.path] }}</strong>
            <el-button
                type="warning"
                size="mini"
                @click="handleImport"
                v-if="
                    $route.path !== '/assets/standard' &&
                    !(
                        $route.path == '/assets/office' &&
                        $store.getters.getRole === 'president'
                    )
                "
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

            <template v-if="$route.path !== '/assets/standard'">
                <el-form-item
                    v-for="(item, index) in form.items"
                    :key="item.name"
                    size="mini"
                >
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
                        type="number"
                        v-model="form.items[index].value"
                        placeholder="请填写"
                    ></el-input>
                </el-form-item>
            </template>
            <template v-else>
                <el-form-item
                    v-for="item in form.standardItems"
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
                        v-model="item.value"
                        placeholder="请填写"
                    ></el-input>
                </el-form-item>
            </template>
            <el-form-item v-if="$route.path !== '/assets/standard'">
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

export default {
    data() {
        return {
            routeMap: Route2MenuItemNameMap,
            options: [
                '房屋折旧',
                '设备折旧',
                '水电费',
                '办公费用',
                '实验耗材',
                '活动经费',
                '共同体系统',
            ],
            form: {
                standardItems: [
                    {
                        name: '院长岗位工资',
                        value: null,
                    },
                ],
                items: [
                    {
                        name: '',
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
        handleImportMember() {
            // console.log(1111)
            this.$refs['fileMember'].click()
        },
        handleImport() {
            this.$refs['fileInput'].click()
        },

        async handleFile() {
            try {
                const file = this.$refs.fileInput.files[0]
                const workbook = (await parseXLSXFile(file))['Sheets']
                const form = []
                console.log(workbook)
                const parseAssets = (sheet) => {
                    let x = 2
                    let key = `A${x}`
                    while (Object.keys(sheet).includes(key)) {
                        const v = sheet[key].v
                        form.push({
                            name: sheet[key].v,
                            value: sheet[`B${x}`].v,
                        })
                        x++
                        key = `A${x}`
                    }
                    console.log(form)
                    this.form.items = form
                }
                if (this.$route.path === '/assets/college') {
                    parseAssets(workbook['学院资源表'])
                }
                if (
                    this.$route.path === '/assets/office' &&
                    this.$store.getters.getRole === 'staffDirector'
                ) {
                    parseAssets(workbook['学工办资源表'])
                }
                if (
                    this.$route.path === '/assets/office' &&
                    this.$store.getters.getRole === 'collegeDirector'
                ) {
                    parseAssets(workbook['学院办资源表'])
                }
                if (
                    this.$route.path === '/assets/office' &&
                    this.$store.getters.getRole === 'studyDirector'
                ) {
                    parseAssets(workbook['教科办资源'])
                }

                this.$message.success('导入资源成功！')
            } catch (e) {
                this.$message.error(`导入资源失败:：${e.message}`)
            }
        },

        async handleImportMemberFile() {
            try {
                const file = this.$refs.fileMember.files[0]
                const workbook = (await parseXLSXFile(file))['Sheets']
                const user = {}
                const parseMember = (sheet, sheetName) => {
                    let x = 2
                    let key = `A${x}`
                    while (Object.keys(sheet).includes(key)) {
                        const v = sheet[key].v
                        if (user[v] === undefined) {
                            user[v] = {}
                            user[v].con = {}
                            user[v].name = sheet[`B${x}`].v
                        }
                        if (user[v].con[sheetName] === undefined) {
                            user[v].con[sheetName] = 0
                        }
                        // user[v].con.push(sheetName)
                        user[v].con[sheetName]++
                        x++
                        key = `A${x}`
                    }
                }
                parseMember(workbook['竞赛'], '竞赛')
                parseMember(workbook['党团'], '党团')
                parseMember(workbook['社团'], '社团')
                parseMember(workbook['全院名单'], '全院名单')
                // console.log(JSON.stringify(user, null, 2))
                localStorage.setItem('abc/member', JSON.stringify(user))
                this.$message.success('导入名单成功！')
            } catch (e) {
                this.$message.error(`导入名单失败:：${e.message}`)
            }
        },
        handleConfirm() {
            confirmInput(
                this.$store.getters.getRole,
                this.$route.path,
                this.$route.path === '/assets/standard'
                    ? this.form.standardItems
                    : this.form.items
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

    created() {
        this.form.items = this.$store.getters.getCollegeItems
    },

    beforeDestroy() {
        this.$store.commit('setCollegeItems', this.form.items)
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
