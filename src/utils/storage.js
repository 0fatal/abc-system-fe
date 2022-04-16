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
export const confirmInput = (role, route, data, tableData) => {
    localStorage.setItem(`abc/${role}${route}`, JSON.stringify(data))

    if (role === 'staffDirector' && tableData) {
        const t = tableData
        const match = (type) => t.find((v) => v.type === type)
        const s = {
            X1: Number(match('学工办整体')['学生管理']),
            K1: Number(match('学工办整体')['科研竞赛']),
            S1: Number(match('学工办整体')['社团管理']),
            D1: Number(match('学工办整体')['党团建设']),
            E: Number(match('学工办整体')['思政课程教学']),

            X2: Number(match('赵老师')['学生管理']),
            K2: Number(match('赵老师')['科研竞赛']),
            S2: Number(match('赵老师')['社团管理']),
            D2: Number(match('赵老师')['党团建设']),

            X3: Number(match('何老师')['学生管理']),
            K3: Number(match('何老师')['科研竞赛']),
            S3: Number(match('何老师')['社团管理']),
            D3: Number(match('何老师')['党团建设']),

            X4: Number(match('何老师')['学生管理']),
            K4: Number(match('何老师')['科研竞赛']),
            S4: Number(match('何老师')['社团管理']),
            D4: Number(match('何老师')['党团建设']),

            X5: Number(match('活动经费')['学生管理']),
            K5: Number(match('活动经费')['科研竞赛']),
            S5: Number(match('活动经费')['社团管理']),
            D5: Number(match('活动经费')['党团建设']),
        }

        s.T1 = s.X1 + s.K1 + s.S1 + s.D1 + s.E
        s.T2 = s.X2 + s.K2 + s.S2 + s.D2
        s.T3 = s.X3 + s.K3 + s.S3 + s.D3
        s.T4 = s.X4 + s.K4 + s.S4 + s.D4
        s.T5 = s.X5 + s.K5 + s.S5 + s.D5

        localStorage.setItem(`abc/staffDirector/rate`, JSON.stringify(s))
    }
}

export const getRate = () => {
    const s = JSON.parse(localStorage.getItem(`abc/staffDirector/rate`))
    if (!s)
        return [
            {
                type: '学工办整体',
                学生管理: 2,
                党团建设: 1,
                社团管理: 1,
                科研竞赛: 1,
                思政课程教学: 1,
            },
            {
                type: '赵老师',
                学生管理: 2,
                党团建设: 0,
                社团管理: 0,
                科研竞赛: 1,
                思政课程教学: null,
            },
            {
                type: '周老师',
                学生管理: 2,
                党团建设: 0,
                社团管理: 1,
                科研竞赛: 0,
                思政课程教学: null,
            },
            {
                type: '何老师',
                学生管理: 2,
                党团建设: 1,
                社团管理: 0,
                科研竞赛: 0,
                思政课程教学: null,
            },
            {
                type: '活动经费',
                学生管理: 2,
                党团建设: 1,
                社团管理: 1,
                科研竞赛: 0,
                思政课程教学: null,
            },
        ]
    return [
        {
            type: '学工办整体',
            学生管理: s.X1,
            党团建设: s.K1,
            社团管理: s.S1,
            科研竞赛: s.D1,
            思政课程教学: s.E,
        },
        {
            type: '赵老师',
            学生管理: s.X2,
            党团建设: s.K2,
            社团管理: s.S2,
            科研竞赛: s.D2,
            思政课程教学: null,
        },
        {
            type: '周老师',
            学生管理: s.X3,
            党团建设: s.K3,
            社团管理: s.S3,
            科研竞赛: s.D3,
            思政课程教学: null,
        },
        {
            type: '何老师',
            学生管理: s.X4,
            党团建设: s.K4,
            社团管理: s.S4,
            科研竞赛: s.D4,
            思政课程教学: null,
        },
        {
            type: '活动经费',
            学生管理: s.X5,
            党团建设: s.K5,
            社团管理: s.S5,
            科研竞赛: s.D5,
            思政课程教学: null,
        },
    ]
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
