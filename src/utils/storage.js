import { roleMap } from '@/role/role'

export const getIsInput = (role) => {
    if (role === 'staffDirector') {
        if (!localStorage.getItem(`abc/member`)) {
            return false
        }
    }
    for (const route of roleMap[role].routes) {
        console.log(route)
        if (route === '/assets/export') continue
        if (!localStorage.getItem(`abc/${role}${route}`)) {
            return false
        }
    }
    return true
}

export const getAllIsInput = () => {
    for (const role in roleMap) {
        if (!getIsInput(role)) {
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

export const hasImportMembers = () => {
    return !!localStorage.getItem(`abc/member`)
}
