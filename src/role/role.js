// 角色对应的可以显示的页面地址
export const roleMap = {
    president: {
        routes: [
            // '/assets/college',
            // '/assets/office',
            // '/assets/standard',
            '/assets/export',
        ],
    },
    // 教科办主任
    studyDirector: {
        routes: [
            // '/assets/office',
            // '/assets/standard',
            '/assets/export',
        ],
    },
    // 学院办主任
    collegeDirector: {
        routes: [
            // '/assets/office',
            // '/assets/standard',
            '/assets/export',
        ],
    },
    // 学工办主任
    staffDirector: {
        routes: [
            // '/assets/office',
            // '/assets/standard',
            '/assets/export',
        ],
    },
}

export const assetsMap = {
    president: {
        routes: ['/assets/college', '/assets/office', '/assets/standard'],
    },
    // 教科办主任
    studyDirector: {
        routes: ['/assets/office', '/assets/standard'],
    },
    // 学院办主任
    collegeDirector: {
        routes: ['/assets/office', '/assets/standard'],
    },
    // 学工办主任
    staffDirector: {
        routes: ['/assets/office', '/assets/standard'],
    },
}

export const getRoleName = (role) => {
    return {
        president: '院长',
        studyDirector: '教科办',
        collegeDirector: '学院办',
        staffDirector: '学工办',
    }[role]
}

// 每个页面对应的标题
export const Route2MenuItemNameMap = {
    '/assets/office': '人员费用',
    '/assets/standard': '资源动因',
    '/assets/college': '学院资源',
    '/assets/export': '报表导出',
}
