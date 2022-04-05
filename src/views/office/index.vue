<template>
    <el-card class="common-card">
        <div slot="header" class="header flex justify-between">
            <strong>{{
                getRoleName($store.getters.getRole) +
                ' / ' +
                routeMap[$route.path]
            }}</strong>
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
        <div>
            <div class="flex justify-between operation">
                <div>
                    <el-button
                        size="mini"
                        @click="handleImportMember"
                        v-if="
                            $route.path === '/assets/office' &&
                            $store.getters.getRole === 'staffDirector'
                        "
                        :type="`${hasImportMembers() ? 'success' : 'primary'}`"
                        >{{
                            hasImportMembers() ? '重新' : ''
                        }}导入人员名单</el-button
                    >
                    <input
                        type="file"
                        v-show="false"
                        accept=".xlsx"
                        ref="fileMember"
                        @change="handleImportMemberFile"
                    />
                    <!-- <el-button size="mini">导入竞赛人员名单</el-button>
                <el-button size="mini">导入党团人员名单</el-button>
                <el-button size="mini">导入社团人员名单</el-button> -->
                </div>
                <el-button type="primary" size="mini" @click="handleConfirm"
                    >确认并保存填写</el-button
                >
            </div>
            <div>
                <el-select
                    v-model="options"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    class="w-[400px]"
                    placeholder="请选择办公室资源"
                    @remove-tag="
                        (tag) => {
                            handleDelete(
                                form.items.findIndex(
                                    (item) => item.name === tag
                                )
                            )
                        }
                    "
                >
                    <el-option
                        v-for="item in options"
                        :key="item"
                        :label="item"
                        :value="item"
                    >
                    </el-option>
                </el-select>
            </div>
            <el-divider></el-divider>
        </div>
        <el-form>
            <el-form-item>
                <strong class="text-[20px]">资源</strong>
                <strong class="text-[20px]">费用</strong>
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
                    <div>
                        <el-input
                            class="w-[200px]"
                            type="number"
                            v-model="form.items[index].value"
                            placeholder="请填写"
                        ></el-input>
                        <el-button
                            class="ml-10"
                            type="danger"
                            @click="handleDelete(index)"
                            >删除</el-button
                        >
                    </div>
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
import { getRoleName, Route2MenuItemNameMap } from '@/role/role'
import { confirmInput, hasImportMembers } from '@/utils/storage'

export default {
    data() {
        return {
            routeMap: Route2MenuItemNameMap,
            options: [], // 下拉框选项
            form: {
                // 保存下拉框选项的值
                items: [],
            },
        }
    },
    methods: {
        // 函数：是否已经导入成员名单
        hasImportMembers: hasImportMembers,
        getRoleName: getRoleName,

        // 函数：添加资源
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

        // 函数：删除某条资源
        handleDelete(index) {
            if (index < 0) return
            this.form.items.splice(index, 1)
        },

        // 函数：导入成员名单
        handleImportMember() {
            // console.log(1111)
            this.$refs['fileMember'].click()
        },

        // 函数：导入资源表格
        handleImport() {
            this.$refs['fileInput'].click()
        },

        // 函数：handleImport调用后自动触发，解析并导入表格
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

                this.options = this.form.items.map((item) => item.name)
                this.$forceUpdate()

                this.$message.success('导入资源成功！')
            } catch (e) {
                this.$message.error(`导入资源失败:：${e.message}`)
            }
        },

        // 函数：handleImportMember调用后自动触发，解析并导入表格
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
                            if (sheetName === '全院名单') {
                                user[v].name = sheet[`B${x}`].v
                                user[v].grade = sheet[`C${x}`].v
                                user[v].major = sheet[`D${x}`].v
                                user[v].class = sheet[`E${x}`].v
                            }
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

        // 确认并保存填写
        handleConfirm() {
            confirmInput(
                this.$store.getters.getRole,
                this.$route.path,
                this.$route.path === '/assets/standard'
                    ? this.form.standardItems
                    : this.form.items
            )
            localStorage.setItem(
                `abc/${this.$store.getters.getRole}/options/office`,
                JSON.stringify(this.options)
            )
            this.$message.success('保存成功！')
        },

        handleVisibilityChange() {
            window.location.reload()
        },
    },

    // 页面创建时初始化上次填写的数据
    created() {
        this.$store.getters['getRole']
        if (
            this.$store.getters.getOfficeItems[0].name === '' &&
            this.$route.path === '/assets/office' &&
            this.$store.getters['getRole'] === 'president'
        ) {
            this.$store.commit('setOfficeItems', [
                {
                    name: '院长岗位工资',
                    value: null,
                },
            ])
        }
        this.form.items = this.$store.getters.getOfficeItems
        this.options = this.$store.getters.getOfficeOptions
    },

    // watch: {
    //     $route(to, from) {
    //         window.location.reload()
    //     },
    // },

    // 页面关闭前保存填写到缓存，但不保存到本地
    beforeDestroy() {
        this.$store.commit('setOfficeOptions', this.options)
        this.$store.commit('setOfficeItems', this.form.items)
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
