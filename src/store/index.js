import { doLogin } from '@/fake/user'
import Vue from 'vue'
import Vuex from 'vuex'
import { roleMap } from '@/role/role'
import { fetchStore } from '@/utils/compute'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        role: null,
        nickname: '',
        items: {
            office: [{ name: '', value: null }],
            college: [{ name: '', value: null }],
        },
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
    },
    getters: {
        getRole: (state) => state.role,
        isLogin: (state) => {
            if (!state.role) {
                state.role = localStorage.getItem('abc/role')
                state.nickname = localStorage.getItem('abc/nickname')
            }

            return !!state.role
        },
        nickname: (state) => state.nickname,
        getRoutes: (state) => {
            return roleMap[state.role].routes
        },
        getOfficeItems: (state) => state.items.office,
        getCollegeItems: (state) => state.items.college,
        getStandardItems: (state) => state.standardItems,
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
        },
    },
    actions: {
        login({ commit }, { username, password }) {
            console.log(username, password)
            const user = doLogin(username, password)
            if (!user) return false
            commit('setRole', user.role)
            commit('setNickname', user.nickname)
            return true
        },
    },
})

export default store
