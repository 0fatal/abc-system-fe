export const roleMap = {
    president: {
        routes: [
            '/assets/college',
            '/assets/office',
            '/assets/standard',
            '/assets/export',
        ],
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

export const Route2MenuItemNameMap = {
    '/assets/office': '分办公室资源',
    '/assets/standard': '分配标准',
    '/assets/college': '学院资源',
    '/assets/export': '数据导出',
}
