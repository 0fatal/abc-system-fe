import { doLogin } from '@/fake/user'
import Vue from 'vue'
import Vuex from 'vuex'
import { roleMap } from '@/role/role'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        role: null,
        nickname: '',
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
