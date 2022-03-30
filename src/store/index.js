import { doLogin } from '@/fake/user'
import Vue from 'vue'
import Vuex from 'vuex'
import { roleMap } from '@/role/role'
import { fetchStore } from '@/utils/storage'

Vue.use(Vuex)

// 临时的全局状态管理
const store = new Vuex.Store({
    state: {
        role: null, // 用户角色
        nickname: '',
        items: {
            // 保存的资源条目
            office: [{ name: '', value: null }],
            college: [{ name: '', value: null }],
        }, // 保存的分配标准条目
        standardItems: [
            {
                name: '房屋面积（平方米）',
                value: null,
            },
            {
                name: '设备数量（台）',
                value: null,
            },
            // {
            //     name: '水电用量（平方米）',
            //     value: null,
            // },
            {
                name: '人数（人）',
                value: null,
            },
        ],
        options: {
            // 保存的下拉框选项
            office: [],
        },
    },
    getters: {
        // 取当前登录用户的角色类型
        getRole: (state) => state.role,
        // 取是否登录
        isLogin: (state) => {
            if (!state.role) {
                state.role = localStorage.getItem('abc/role')
                state.nickname = localStorage.getItem('abc/nickname')

                state.standardItems =
                    fetchStore(`abc/${state.role}/assets/standard`) ||
                    state.standardItems
                state.items.office =
                    fetchStore(`abc/${state.role}/assets/office`) ||
                    state.items.office
                state.items.college =
                    fetchStore(`abc/president/assets/college`) ||
                    state.items.college
                state.options.office =
                    fetchStore(`abc/${state.role}/options/office`) ||
                    state.role === 'president'
                        ? ['院长岗位工资']
                        : []
            }

            return !!state.role
        },
        // 取当前登录用户的昵称
        nickname: (state) => state.nickname,
        // 取当前登录用户的可以打开的页面地址，并显示在侧边栏
        getRoutes: (state) => {
            return roleMap[state.role].routes
        },
        // 取保存的办公室资源
        getOfficeItems: (state) => state.items.office,
        // 取保存的学院资源
        getCollegeItems: (state) => state.items.college,
        // 取保存的分配标准
        getStandardItems: (state) => state.standardItems,
        // 取保存的下拉框选项
        getOfficeOptions: (state) => state.options.office,
    },
    mutations: {
        setRole(state, role) {
            localStorage.setItem('abc/role', role)
            state.role = role
        },
        setNickname(state, nickname) {
            localStorage.setItem('abc/nickname', nickname)
            state.nickname = nickname
        },
        setOfficeItems(state, items) {
            state.items.office = items
        },
        setStandardItems(state, items) {
            state.standardItems = items
        },
        setCollegeItems(state, items) {
            state.items.college = items
        },
        initItems(state) {
            state.standardItems =
                fetchStore(`abc/${state.role}/assets/standard`) ||
                state.standardItems
            state.items.office =
                fetchStore(`abc/${state.role}/assets/office`) ||
                state.items.office
            state.items.college =
                fetchStore(`abc/president/assets/college`) ||
                state.items.college
            state.options.office =
                fetchStore(`abc/${state.role}/options/office`) || []
        },
        setOfficeOptions(state, options) {
            state.options.office = options
            localStorage.setItem(
                `abc/${state.role}/options/office`,
                JSON.stringify(options)
            )
        },
    },
    actions: {
        login({ commit, getters }, { username, password }) {
            console.log(username, password)
            const user = doLogin(username, password)
            if (!user) return false
            commit('setRole', user.role)
            commit('setNickname', user.nickname)
            return getters.isLogin
        },
    },
})

export default store
