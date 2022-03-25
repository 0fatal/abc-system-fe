import { roleMap } from '@/role/role'

export const getIsInput = (role) => {
    console.log(role)
    for (const route of roleMap[role].routes) {
        console.log(route)
        if (route === '/assets/export') continue
        if (!localStorage.getItem(`abc/${role}${route}`)) {
            return false
        }
    }
    return true
}

export const confirmInput = (role, route, data) => {
    localStorage.setItem(`abc/${role}${route}`, JSON.stringify(data))
}

export const clearInput = (role) => {
    for (const route of roleMap[role].routes) {
        localStorage.removeItem(`abc/${role}${route}`)
    }
}

export const getInput = (role, route) => {
    return JSON.parse(localStorage.getItem(`abc/${role}${route}`))
}
