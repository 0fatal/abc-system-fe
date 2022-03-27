import { roleMap } from '@/role/role'
import * as xlsx from 'xlsx'

const fileDownload = require('js-file-download')

const fetchStore = (key) => {
    return JSON.parse(localStorage.getItem(key))
}

const fetchAssetsByRole = (role) => {
    return {
        [role]: {
            office: fetchStore(`/abc/${role}/assets/office`),
            standard: fetchStore(`/abc/${role}/assets/standard`),
        },
    }
}

const fetchCollegeAssets = (asset) => {
    return fetchStore(`/abc/${role}/assets/college`)[asset]
}

const fetchAssetsByAsset = (asset) => {
    const data = {}
    for (const role in roleMap) {
        data[role] = fetchStore(`/abc/${role}/assets/${asset}`)
    }
    return data
}

const fetchStandardByKey = (key, totalFee) => {
    const data = fetchAssetsByAsset('standard')
    const res = { data: {}, total: 0 }
    for (const role in data) {
        res.data[role] = {}
        const item = data[role]
        res.data[role].v = item.find((v) => v.name === key).value || 0
        res.total += res.data[role].v
    }
    res['avg'] = res.total / Object.keys(data).length
    for (const role in data) {
        res.data[role].w = res.data[role] / res.total
        if (totalFee) {
            res.data[role].fee = res.data[role].w * totalFee
        }
    }
    return res
}

//   获取薪酬
const fetchSalary = () => {
    const data = fetchAssetsByAsset('office')
    const res = {}
    Object.keys(data).forEach((k) => {
        res[k] = {
            gangwei: { data: {}, total: 0 },
            shouke: { data: {}, total: 0 },
            total: 0,
        }
        data[k].forEach((v) => {
            if (v.name.match(/岗位/)) {
                res[k].gangwei.data[v.name] = v.value
                res[k].gangwei.total += v.value
            } else {
                res[k].shouke.data[v.name] = v.value
                res[k].shouke.total += v.value
            }
        })
    })
    return res
}
// 学生管理 党团建设 社团管理 科研竞赛 思政课程教学

const processData = () => {
    // 总资源，fetchCollegeAssets 房屋折旧 设备折旧 水电费 办公费用 实验耗材 活动经费 共同体系统 院长岗位工资
    const fangwu = fetchCollegeAssets('房屋折旧')
    const shebei = fetchCollegeAssets('设备折旧')
    const shui = fetchCollegeAssets('水电费')
    const bangong = fetchCollegeAssets('办公费用')
    const shiyan = fetchCollegeAssets('实验耗材')
    const huodong = fetchCollegeAssets('活动经费')
    const gongtong = fetchCollegeAssets('共同体系统')
    const yuangong = fetchCollegeAssets('院长岗位工资') //TODO 院长岗位工资

    let deviceCount = fetchStandardByKey('设备数量（台）', shebei)
    // TODO 总人数包括院长吗
    let peopleCount = fetchStandardByKey('人数（人）', bangong) // 人数
    // let waterCount = fetchStandardByKey('水电用量（平方米', shui) // 水电费
    let squareCount = fetchStandardByKey('房屋面积（平方米）', fangwu) // 房屋面积

    const salary = fetchSalary()

    const computeFeeClassify = () => {
        const res = {}
        // 学院管理
        res['学院管理'] = {
            房屋折旧:
                ((squareCount.data['president'] +
                    squareCount.data['collegeDirector']) /
                    squareCount.total) *
                fangwu,
            设备折旧:
                ((deviceCount.data['president'] +
                    deviceCount.data['collegeDirector']) /
                    deviceCount.total) *
                shebei,
            水电费:
                ((squareCount.data['president'] +
                    squareCount.data['collegeDirector']) /
                    squareCount.total) *
                shui,
            行政老师薪酬:
                salary['collegeDirector'].gangwei.total +
                salary['president'].gangwei.total,
            办公费用:
                ((peopleCount.data['president'] +
                    peopleCount.data['collegeDirector']) /
                    peopleCount.total) *
                bangong,
        }

        res['学院管理'].total =
            res['学院管理'].水电费 +
            res['学院管理'].办公费用 +
            res['学院管理'].设备折旧 +
            res['学院管理'].房屋折旧 +
            res['学院管理'].行政老师薪酬

        // 学生管理
        res['学生管理'] = {
            房屋折旧:
                (2 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                fangwu,
            设备折旧:
                (2 / 6) *
                (deviceCount.data['staffDirector'] / deviceCount.total) *
                shebei,
            水电费:
                (2 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                shui,
            行政老师薪酬: (2 / 3) * salary['staffDirector'].gangwei.total,
            办公费用:
                (2 / 6) *
                (peopleCount.data['staffDirector'] / peopleCount.total) *
                bangong,
            活动经费: (2 / 4) * huodong,
            共同体系统折旧: gongtong,
            学院管理:
                (((2 / 6) * peopleCount.data['staffDirector']) /
                    peopleCount.total) *
                res['学院管理'].total,
        }
        res['学生管理'].total =
            res['学生管理']['水电费'] +
            res['学生管理']['办公费用'] +
            res['学生管理']['设备折旧'] +
            res['学生管理']['房屋折旧'] +
            res['学生管理']['行政老师薪酬'] +
            res['学生管理']['活动经费'] +
            res['学生管理']['共同体系统折旧'] +
            res['学生管理']['学院管理']

        // 学生管理
        res['思政课程教学'] = {
            房屋折旧:
                (1 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                fangwu,
            设备折旧:
                (1 / 6) *
                (deviceCount.data['staffDirector'] / deviceCount.total) *
                shebei,
            水电费:
                (1 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                shui,
            行政老师薪酬: (2 / 3) * salary['staffDirector'].shouke.total, // TODO 授课薪酬
            办公费用:
                (1 / 6) *
                (peopleCount.data['staffDirector'] / peopleCount.total) *
                bangong,
            学院管理:
                (((1 / 6) * peopleCount.data['staffDirector']) /
                    peopleCount.total) *
                res['学院管理'].total,
        }

        res['思政课程教学'].total =
            res['思政课程教学'].水电费 +
            res['思政课程教学'].办公费用 +
            res['思政课程教学'].设备折旧 +
            res['思政课程教学'].房屋折旧 +
            res['思政课程教学'].行政老师薪酬 +
            res['思政课程教学'].学院管理

        res['社团管理'] = {
            房屋折旧:
                (1 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                fangwu,
            设备折旧:
                (1 / 6) *
                (deviceCount.data['staffDirector'] / deviceCount.total) *
                shebei,
            水电费:
                (1 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                shui,
            行政老师薪酬:
                (1 / 3) *
                salary['staffDirector'].gangwei.data['周老师岗位薪酬'],
            办公费用:
                (1 / 6) *
                (peopleCount.data['staffDirector'] / peopleCount.total) *
                bangong,
            活动经费: (2 / 4) * huodong,
            学院管理:
                (((1 / 6) * peopleCount.data['staffDirector']) /
                    peopleCount.total) *
                res['学院管理'].total,
        }

        res['社团管理'].total =
            res['社团管理'].水电费 +
            res['社团管理'].办公费用 +
            res['社团管理'].设备折旧 +
            res['社团管理'].房屋折旧 +
            res['社团管理'].行政老师薪酬 +
            res['社团管理'].活动经费 +
            res['社团管理'].学院管理

        res['科研竞赛'] = {
            房屋折旧:
                (1 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                fangwu,
            设备折旧:
                (1 / 6) *
                (deviceCount.data['staffDirector'] / deviceCount.total) *
                shebei,
            水电费:
                (1 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                shui,
            行政老师薪酬:
                (1 / 3) *
                salary['staffDirector'].gangwei.data['赵老师岗位薪酬'],
            办公费用:
                (1 / 6) *
                (peopleCount.data['staffDirector'] / peopleCount.total) *
                bangong,
            实验耗材: shiyan,
            学院管理:
                (((1 / 6) * peopleCount.data['staffDirector']) /
                    peopleCount.total) *
                res['学院管理'].total,
        }

        res['科研竞赛'].total =
            res['科研竞赛'].水电费 +
            res['科研竞赛'].办公费用 +
            res['科研竞赛'].设备折旧 +
            res['科研竞赛'].房屋折旧 +
            res['科研竞赛'].行政老师薪酬 +
            res['科研竞赛'].实验耗材 +
            res['科研竞赛'].学院管理

        res['党团建设'] = {
            房屋折旧:
                (1 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                fangwu,
            设备折旧:
                (1 / 6) *
                (deviceCount.data['staffDirector'] / deviceCount.total) *
                shebei,
            水电费:
                (1 / 6) *
                (squareCount.data['staffDirector'] / squareCount.total) *
                shui,
            行政老师薪酬:
                (1 / 3) *
                salary['staffDirector'].gangwei.data['何老师岗位薪酬'],
            办公费用:
                (1 / 6) *
                (peopleCount.data['staffDirector'] / peopleCount.total) *
                bangong,
            活动经费: (1 / 4) * huodong,
            学院管理:
                (((1 / 6) * peopleCount.data['staffDirector']) /
                    peopleCount.total) *
                res['学院管理'].total,
        }

        res['党团建设'].total =
            res['党团建设'].水电费 +
            res['党团建设'].办公费用 +
            res['党团建设'].设备折旧 +
            res['党团建设'].房屋折旧 +
            res['党团建设'].行政老师薪酬 +
            res['党团建设'].学院管理

        res['教学事务管理'] = {
            房屋折旧:
                (squareCount.data['studyDirector'] / squareCount.total) *
                fangwu,
            设备折旧:
                (deviceCount.data['studyDirector'] / deviceCount.total) *
                shebei,
            水电费:
                (squareCount.data['studyDirector'] / squareCount.total) * shui,
            行政老师薪酬: salary['studyDirector'].gangwei.total,
            办公费用:
                (peopleCount.data['studyDirector'] / peopleCount.total) *
                bangong,
            学院管理:
                (peopleCount.data['studyDirector'] / peopleCount.total) *
                res['学院管理'].total,
        }

        res['教学事务管理'].total =
            res['教学事务管理'].水电费 +
            res['教学事务管理'].办公费用 +
            res['教学事务管理'].设备折旧 +
            res['教学事务管理'].房屋折旧 +
            res['教学事务管理'].行政老师薪酬 +
            res['教学事务管理'].学院管理

        return res
    }

    const data = computeFeeClassify()
    return data
}

const computeData = () => {
    const data = processData()
    // 1. 所有资源加起来
    // 2. 总费用 院长填
    // 3. 分配数量是分配标准
    // 4. 费用 是 总费用/分配总数 * 分配标准树数目
    // 5. 再用公式计算出四块的大小

    // 除以总人数
}

const downloadFile = () => {
    fileDownload(data, 'export.xlsx')
}

export const exportData = () => {
    const data = computeData()

    // const sheet = XLSX.utils.json_to_sheet(data)

    const headerDisplay = {
        资源: '',
        工资: '',
        总费用: '总费用',
        分配标准总数: '分配标准总数',
        院长办: '院长办',
        费用: '费用',
        学院办: '学院办',
        费用: '费用',
        教科办: '教科办',
        教科办: '费用',
        学工办: '学工办',
        学生管理: '学生管理',
        党团建设: '党团建设',
        社团管理: '社团管理',
        科研竞赛: '科研竞赛',
        思政课程教学: '思政课程教学',
        学工办合计: '学工办合计',
    }

    const header = Object.keys(headerDisplay)

    const fangwu = fetchCollegeAssets('房屋折旧')
    const shebei = fetchCollegeAssets('设备折旧')
    const shui = fetchCollegeAssets('水电费')
    const bangong = fetchCollegeAssets('办公费用')
    const shiyan = fetchCollegeAssets('实验耗材')
    const huodong = fetchCollegeAssets('活动经费')
    const gongtong = fetchCollegeAssets('共同体系统')
    const xueyuan = fetchCollegeAssets('学院管理') // TODO localStorage

    let deviceCount = fetchStandardByKey('设备数量（台）', shebei)
    // TODO 总人数包括院长吗
    let peopleCount = fetchStandardByKey('人数（人）', bangong) // 人数
    let waterCount = fetchStandardByKey('水电用量（平方米）', shui) // 水电费
    let squareCount = fetchStandardByKey('房屋面积（平方米）', fangwu) // 房屋面积

    const salary = fetchSalary()

    // TODO 院长办公室资源

    const sheet = [
        {
            资源: '房屋折旧',
            总费用: fangwu,
            分配标准总数: `${squareCount.total}平方米`,
            院长办: `${squareCount.data['president'].v}`,
            费用: `${squareCount.data['president'].fee}`,
            学院办: `${squareCount.data['collegeDirector'].v}`,
            费用: `${squareCount.data['collegeDirector'].fee}`,
            教科办: `${squareCount.data['studyDirector'].v}`,
            费用: `${squareCount.data['studyDirector'].fee}`,
            学工办: `${squareCount.data['staffDirector'].v}`,
            学生管理: data['学生管理']['房屋折旧'],
            党团建设: data['党团建设']['房屋折旧'],
            社团管理: data['社团管理']['房屋折旧'],
            科研竞赛: data['科研竞赛']['房屋折旧'],
            思政课程教学: data['思政课程教学']['房屋折旧'],
            学工办合计: `${squareCount.data['staffDirector'].fee}`,
        },
        {
            资源: '设备折旧',
            总费用: shebei,
            分配标准总数: `${deviceCount.total}台`,
            院长办: `${deviceCount.data['president'].v}`,
            费用: `${deviceCount.data['president'].fee}`,
            学院办: `${deviceCount.data['collegeDirector'].v}`,
            费用: `${deviceCount.data['collegeDirector'].fee}`,
            教科办: `${deviceCount.data['studyDirector'].v}`,
            费用: `${deviceCount.data['studyDirector'].fee}`,
            学工办: `${deviceCount.data['staffDirector'].v}`,
            学生管理: data['学生管理']['设备折旧'],
            党团建设: data['党团建设']['设备折旧'],
            社团管理: data['社团管理']['设备折旧'],
            科研竞赛: data['科研竞赛']['设备折旧'],
            思政课程教学: data['思政课程教学']['设备折旧'],
            学工办合计: `${deviceCount.data['staffDirector'].fee}`,
        },
        {
            资源: '水电费',
            总费用: shui,
            分配标准总数: `${waterCount.total}平方米`,
            院长办: `${waterCount.data['president'].v}`,
            费用: `${waterCount.data['president'].fee}`,
            学院办: `${waterCount.data['collegeDirector'].v}`,
            费用: `${waterCount.data['collegeDirector'].fee}`,
            教科办: `${waterCount.data['studyDirector'].v}`,
            费用: `${waterCount.data['studyDirector'].fee}`,
            学工办: `${waterCount.data['staffDirector'].v}`,
            学生管理: data['学生管理']['水电费'],
            党团建设: data['党团建设']['水电费'],
            社团管理: data['社团管理']['水电费'],
            科研竞赛: data['科研竞赛']['水电费'],
            思政课程教学: data['思政课程教学']['水电费'],
            学工办合计: `${waterCount.data['staffDirector'].fee}`,
        },
        {
            资源: '办公费用',
            总费用: bangong,
            分配标准总数: `${peopleCount.total}人`,
            院长办: `${peopleCount.data['president'].v}`,
            费用: `${peopleCount.data['president'].fee}`,
            学院办: `${peopleCount.data['collegeDirector'].v}`,
            费用: `${peopleCount.data['collegeDirector'].fee}`,
            教科办: `${peopleCount.data['studyDirector'].v}`,
            费用: `${peopleCount.data['studyDirector'].fee}`,
            学工办: `${peopleCount.data['staffDirector'].v}`,
            学生管理: data['学生管理']['办公费用'],
            党团建设: data['党团建设']['办公费用'],
            社团管理: data['社团管理']['办公费用'],
            科研竞赛: data['科研竞赛']['办公费用'],
            思政课程教学: data['思政课程教学']['办公费用'],
            学工办合计: `${peopleCount.data['staffDirector'].fee}`,
        },
        {
            资源: '活动经费',
            总费用: huodong,
            学生管理: data['学生管理']['活动经费'],
            党团建设: data['党团建设']['活动经费'],
            社团管理: data['社团管理']['活动经费'],
            学工办合计:
                data['学生管理']['活动经费'] +
                data['党团建设']['活动经费'] +
                data['社团管理']['活动经费'],
        },
        {
            资源: '共同体系统',
            总费用: gongtong,
            学生管理: data['学生管理']['共同体系统'],
            学工办合计: data['学生管理']['共同体系统'],
        },
        // TODO 学院
        {
            资源: '学院管理',
            总费用: xueyuan,
            学生管理: data['学生管理']['学院管理'],
            党团建设: data['党团建设']['学院管理'],
            社团管理: data['社团管理']['学院管理'],
            科研竞赛: data['科研竞赛']['学院管理'],
            思政课程教学: data['思政课程教学']['学院管理'],
            学工办合计: data['学院管理'].total,
        },
        {
            工资: '院长岗位工资',
            总费用: '', // TODO 院长工资
        },
        ...Object.entries(salary['staffDirector'].gangwei).map(([name, v]) => {
            return {
                工资: name,
                总费用: v,
            }
        }),
        ...Object.entries(salary['staffDirector'].shouke).map(([name, v]) => {
            return {
                工资: name,
                总费用: v,
            }
        }),
    ]

    // 将data 映射为 xlsx文件
    fileDownload(exportData)
}
