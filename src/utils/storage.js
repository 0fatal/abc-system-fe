import { roleMap } from '@/role/role'

// 判断某个角色是否已经完成填写，具体实现：判断是否有对应的本地存储
export const getIsInput = (role) => {
    // 如果是学工办，还得确认名单是否已导入
    if (role === 'staffDirector') {
        if (!localStorage.getItem(`abc/member`)) {
            return false
        }
    }
    // 遍历每个资源
    for (const route of roleMap[role].routes) {
        console.log(route)
        if (route === '/assets/export') continue
        if (!localStorage.getItem(`abc/${role}${route}`)) {
            return false
        }
    }
    return true
}

// 判断所有角色是否已经完成填写
export const getAllIsInput = () => {
    for (const role in roleMap) {
        if (!getIsInput(role)) {
            return false
        }
    }
    return true
}

// 保存填写
export const confirmInput = (role, route, data,tableData) => {
    localStorage.setItem(`abc/${role}${route}`, JSON.stringify(data))
    if(role === 'staffDirector' && tableData){
        const t =tableData
        const match = (type) =>t.find((v) => v.type === type)
        const s = {
            X1: match('学工办整体')['学生管理'],
            K1: match('学工办整体')['科研竞赛'],
            S1:match('学工办整体')['社团管理'],
            D1: match('学工办整体')['党团建设'],
            E:match('学工办整体')['思政课程教学'],

            X2: match('赵老师')['学生管理'],
            K2: match('赵老师')['科研竞赛'],
            S2:match('赵老师')['社团管理'],
            D2: match('赵老师')['党团建设'],

            X3: match('何老师')['学生管理'],
            K3: match('何老师')['科研竞赛'],
            S3:match('何老师')['社团管理'],
            D3: match('何老师')['党团建设'],

            X4: match('何老师')['学生管理'],
            K4: match('何老师')['科研竞赛'],
            S4:match('何老师')['社团管理'],
            D4: match('何老师')['党团建设'],
        }
        localStorage.setItem(`abc/staffDirector/rate`, JSON.stringify(s))
    }
}

// 清除某个角色的填写
export const clearInput = (role) => {
    for (const route of roleMap[role].routes) {
        localStorage.removeItem(`abc/${role}${route}`)
    }
}

// 取得某个角色填写的数据
export const getInput = (role, route) => {
    return JSON.parse(localStorage.getItem(`abc/${role}${route}`))
}

// 判断是否已经导入名单
export const hasImportMembers = () => {
    return !!localStorage.getItem(`abc/member`)
}

// 取出本地数据
export const fetchStore = (key) => {
    return JSON.parse(localStorage.getItem(key))
}
