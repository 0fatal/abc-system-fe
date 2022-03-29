import { roleMap } from '@/role/role'
import * as xlsx from 'xlsx'
import { keepTwoDecimal } from './num'

const fileDownload = require('js-file-download')

export const fetchStore = (key) => {
    return JSON.parse(localStorage.getItem(key))
}

const fetchAssetsByRole = (role) => {
    return {
        [role]: {
            office: fetchStore(`abc/${role}/assets/office`),
            standard: fetchStore(`abc/${role}/assets/standard`),
        },
    }
}

const fetchMember = () => {
    return fetchStore('abc/member')
}

const fetchCollegeAssets = (asset) => {
    if (asset === '院长岗位工资') {
        console.log('院长岗位工资', fetchSalary()['president'].gangwei.total)
        return fetchSalary()['president'].gangwei.total
    }
    return Number(
        fetchStore(`abc/president/assets/college`).find(
            (v) => v?.name === asset
        )?.value || 0
    )
}

const fetchAssetsByAsset = (asset) => {
    const data = {}
    for (const role in roleMap) {
        data[role] = fetchStore(`abc/${role}/assets/${asset}`)
    }
    return data
}

const fetchStandardByKey = (key, totalFee) => {
    const data = fetchAssetsByAsset('standard')
    const res = { data: {}, total: 0 }
    for (const role in data) {
        res.data[role] = {}
        const item = data[role]
        res.data[role].v = Number(item.find((v) => v.name === key).value || 0)
        res.total += res.data[role].v
    }
    res['avg'] = keepTwoDecimal(res.total / Object.keys(data).length)
    for (const role in data) {
        res.data[role].w = res.data[role].v / res.total
        if (totalFee) {
            res.data[role].fee = keepTwoDecimal(res.data[role].w * totalFee)
        }
    }
    return res
}

//   获取工资
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
                res[k].gangwei.data[v.name] = Number(v.value)
                res[k].gangwei.total += Number(v.value)
            } else {
                res[k].shouke.data[v.name] = v.value
                res[k].shouke.total += v.value
            }
        })
        res[k].total = res[k].gangwei.total + res[k].shouke.total
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
    const yuangong = fetchCollegeAssets('院长岗位工资')
    console.log(
        'fangwu',
        fangwu,
        'shebei',
        shebei,
        'shui',
        shui,
        'bangong',
        bangong,
        'shiyan',
        shiyan,
        'huodong',
        huodong,
        'gongtong',
        gongtong,
        'yuangong',
        yuangong
    )

    let deviceCount = fetchStandardByKey('设备数量（台）', shebei)
    let peopleCount = fetchStandardByKey('人数（人）', bangong) // 人数
    // let waterCount = fetchStandardByKey('水电用量（平方米', shui) // 水电费
    let squareCount = fetchStandardByKey('房屋面积（平方米）', fangwu) // 房屋面积

    console.log('deviceCount', deviceCount)
    console.log('peopleCount', peopleCount)
    console.log('squareCount', squareCount)

    const salary = fetchSalary()

    console.log('salary', salary)
    console.log(
        peopleCount.data['president'],
        peopleCount.data['collegeDirector']
    )

    const computeFeeClassify = () => {
        const res = {}
        // 学院管理
        res['学院管理'] = {
            房屋折旧:
                keepTwoDecimal(
                    (squareCount.data['president'].v +
                        squareCount.data['collegeDirector'].v) /
                        squareCount.total
                ) * fangwu,
            设备折旧:
                keepTwoDecimal(
                    (deviceCount.data['president'].v +
                        deviceCount.data['collegeDirector'].v) /
                        deviceCount.total
                ) * shebei,
            水电费:
                keepTwoDecimal(
                    (squareCount.data['president'].v +
                        squareCount.data['collegeDirector'].v) /
                        squareCount.total
                ) * shui,
            行政老师工资:
                salary['president'].gangwei.total +
                salary['collegeDirector'].gangwei.total,
            办公费用:
                keepTwoDecimal(
                    (peopleCount.data['president'].v +
                        peopleCount.data['collegeDirector'].v) /
                        peopleCount.total
                ) * bangong,
        }

        res['学院管理'].total =
            res['学院管理'].水电费 +
            res['学院管理'].办公费用 +
            res['学院管理'].设备折旧 +
            res['学院管理'].房屋折旧 +
            res['学院管理'].行政老师工资

        // 学生管理
        res['学生管理'] = {
            房屋折旧: keepTwoDecimal(
                (2 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (2 / 6) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (2 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: keepTwoDecimal(
                (2 / 3) * salary['staffDirector'].gangwei.total
            ),
            办公费用: keepTwoDecimal(
                (2 / 6) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            活动经费: keepTwoDecimal((2 / 4) * huodong),
            共同体系统: gongtong,
            学院管理: keepTwoDecimal(
                (((2 / 6) * peopleCount.data['staffDirector'].v) /
                    (peopleCount.data['staffDirector'].v +
                        peopleCount.data['studyDirector'].v)) *
                    res['学院管理'].total
            ),
        }
        res['学生管理'].total =
            res['学生管理']['水电费'] +
            res['学生管理']['办公费用'] +
            res['学生管理']['设备折旧'] +
            res['学生管理']['房屋折旧'] +
            res['学生管理']['行政老师工资'] +
            res['学生管理']['活动经费'] +
            res['学生管理']['共同体系统折旧'] +
            res['学生管理']['学院管理']

        // 学生管理
        res['思政课程教学'] = {
            房屋折旧: keepTwoDecimal(
                (1 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (1 / 6) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (1 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: salary['staffDirector'].shouke.total,
            办公费用: keepTwoDecimal(
                (1 / 6) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            学院管理: keepTwoDecimal(
                (((1 / 6) * peopleCount.data['staffDirector'].v) /
                    (peopleCount.data['staffDirector'].v +
                        peopleCount.data['studyDirector'].v)) *
                    res['学院管理'].total
            ),
        }

        res['思政课程教学'].total =
            res['思政课程教学'].水电费 +
            res['思政课程教学'].办公费用 +
            res['思政课程教学'].设备折旧 +
            res['思政课程教学'].房屋折旧 +
            res['思政课程教学'].行政老师工资 +
            res['思政课程教学'].学院管理

        res['社团管理'] = {
            房屋折旧: keepTwoDecimal(
                (1 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (1 / 6) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (1 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: keepTwoDecimal(
                (1 / 3) * salary['staffDirector'].gangwei.data['周老师岗位工资']
            ),
            办公费用: keepTwoDecimal(
                (1 / 6) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            活动经费: keepTwoDecimal((1 / 4) * huodong),
            学院管理: keepTwoDecimal(
                (((1 / 6) * peopleCount.data['staffDirector'].v) /
                    (peopleCount.data['staffDirector'].v +
                        peopleCount.data['studyDirector'].v)) *
                    res['学院管理'].total
            ),
        }

        res['社团管理'].total =
            res['社团管理'].水电费 +
            res['社团管理'].办公费用 +
            res['社团管理'].设备折旧 +
            res['社团管理'].房屋折旧 +
            res['社团管理'].行政老师工资 +
            res['社团管理'].活动经费 +
            res['社团管理'].学院管理

        res['科研竞赛'] = {
            房屋折旧: keepTwoDecimal(
                (1 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (1 / 6) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (1 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: keepTwoDecimal(
                (1 / 3) * salary['staffDirector'].gangwei.data['赵老师岗位工资']
            ),
            办公费用: keepTwoDecimal(
                (1 / 6) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            实验耗材: shiyan,
            学院管理: keepTwoDecimal(
                (((1 / 6) * peopleCount.data['staffDirector'].v) /
                    (peopleCount.data['staffDirector'].v +
                        peopleCount.data['studyDirector'].v)) *
                    res['学院管理'].total
            ),
        }

        res['科研竞赛'].total =
            res['科研竞赛'].水电费 +
            res['科研竞赛'].办公费用 +
            res['科研竞赛'].设备折旧 +
            res['科研竞赛'].房屋折旧 +
            res['科研竞赛'].行政老师工资 +
            res['科研竞赛'].实验耗材 +
            res['科研竞赛'].学院管理

        res['党团建设'] = {
            房屋折旧: keepTwoDecimal(
                (1 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (1 / 6) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (1 / 6) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: keepTwoDecimal(
                (1 / 3) * salary['staffDirector'].gangwei.data['何老师岗位工资']
            ),
            办公费用: keepTwoDecimal(
                (1 / 6) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            活动经费: keepTwoDecimal((1 / 4) * huodong),
            学院管理: keepTwoDecimal(
                (((1 / 6) * peopleCount.data['staffDirector'].v) /
                    (peopleCount.data['staffDirector'].v +
                        peopleCount.data['studyDirector'].v)) *
                    res['学院管理'].total
            ),
        }

        res['党团建设'].total =
            res['党团建设'].水电费 +
            res['党团建设'].办公费用 +
            res['党团建设'].设备折旧 +
            res['党团建设'].房屋折旧 +
            res['党团建设'].行政老师工资 +
            res['党团建设'].学院管理

        res['教学事务管理'] = {
            房屋折旧: keepTwoDecimal(
                (squareCount.data['studyDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (deviceCount.data['studyDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (squareCount.data['studyDirector'].v / squareCount.total) * shui
            ),
            行政老师工资: salary['studyDirector'].gangwei.total,
            办公费用: keepTwoDecimal(
                (peopleCount.data['studyDirector'].v / peopleCount.total) *
                    bangong
            ),
            学院管理: keepTwoDecimal(
                (peopleCount.data['studyDirector'].v /
                    (peopleCount.data['staffDirector'].v +
                        peopleCount.data['studyDirector'].v)) *
                    res['学院管理'].total
            ),
        }

        res['教学事务管理'].total =
            res['教学事务管理'].水电费 +
            res['教学事务管理'].办公费用 +
            res['教学事务管理'].设备折旧 +
            res['教学事务管理'].房屋折旧 +
            res['教学事务管理'].行政老师工资 +
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
    return data
}

const downloadFile = () => {
    fileDownload(data, 'export.xlsx')
}

export const exportData = () => {
    const data = computeData()

    // const sheet = xlsx.utils.json_to_sheet(data)

    const headerDisplay = {
        资源: '',
        工资: '',
        总费用: '总费用',
        分配标准总数: '分配标准总数',
        院长办: '院长办',
        院长办费用: '费用',
        学院办: '学院办',
        学院办费用: '费用',
        教科办: '教科办',
        教科办费用: '费用',
        学工办: '学工办',
        学生管理: '学生管理',
        党团建设: '党团建设',
        社团管理: '社团管理',
        科研竞赛: '科研竞赛',
        思政课程教学: '思政课程教学',
        学工办合计: '学工办合计',
        比例: '',
    }

    const header = Object.keys(headerDisplay)

    const fangwu = fetchCollegeAssets('房屋折旧')
    const shebei = fetchCollegeAssets('设备折旧')
    const shui = fetchCollegeAssets('水电费')
    const bangong = fetchCollegeAssets('办公费用')
    const shiyan = fetchCollegeAssets('实验耗材')
    const huodong = fetchCollegeAssets('活动经费')
    const gongtong = fetchCollegeAssets('共同体系统')

    let deviceCount = fetchStandardByKey('设备数量（台）', shebei)
    let peopleCount = fetchStandardByKey('人数（人）', bangong) // 人数
    let waterCount = fetchStandardByKey('房屋面积（平方米）', shui) // 水电费
    let squareCount = fetchStandardByKey('房屋面积（平方米）', fangwu) // 房屋面积

    const salary = fetchSalary()
    const members = fetchMember()
    console.log(members)

    console.log(data)
    const studentM =
        data['学生管理']['活动经费'] +
        data['学生管理']['房屋折旧'] +
        data['学生管理']['设备折旧'] +
        data['学生管理']['共同体系统'] +
        data['学生管理']['行政老师工资'] +
        data['学生管理']['学院管理'] +
        data['学生管理']['办公费用'] +
        data['学生管理']['水电费']

    const dangtuanM =
        data['党团建设']['活动经费'] +
        data['党团建设']['房屋折旧'] +
        data['党团建设']['设备折旧'] +
        data['党团建设']['行政老师工资'] +
        data['党团建设']['学院管理'] +
        data['党团建设']['办公费用'] +
        data['党团建设']['水电费']

    const shetuanM =
        data['社团管理']['活动经费'] +
        data['社团管理']['房屋折旧'] +
        data['社团管理']['设备折旧'] +
        data['社团管理']['行政老师工资'] +
        data['社团管理']['学院管理'] +
        data['社团管理']['办公费用'] +
        data['社团管理']['水电费']
    const keyanM =
        data['科研竞赛']['房屋折旧'] +
        data['科研竞赛']['设备折旧'] +
        data['科研竞赛']['水电费'] +
        data['科研竞赛']['行政老师工资'] +
        data['科研竞赛']['学院管理'] +
        data['科研竞赛']['办公费用'] +
        data['科研竞赛']['实验耗材']
    const sizhengM =
        data['思政课程教学']['房屋折旧'] +
        data['思政课程教学']['设备折旧'] +
        data['思政课程教学']['行政老师工资'] +
        data['思政课程教学']['学院管理'] +
        data['思政课程教学']['办公费用'] +
        data['思政课程教学']['水电费']

    const jiaokeTotal =
        squareCount.data['studyDirector'].fee +
        deviceCount.data['studyDirector'].fee +
        waterCount.data['studyDirector'].fee +
        peopleCount.data['studyDirector'].fee +
        keepTwoDecimal(
            (peopleCount.data['studyDirector'].v /
                (peopleCount.data['studyDirector'].v +
                    peopleCount.data['staffDirector'].v)) *
                data['学院管理'].total
        ) +
        salary['studyDirector'].total

    const dangtuanAvg = keepTwoDecimal(
        dangtuanM /
            Object.values(members).reduce(
                (p, c) => p + (c?.con['党团'] || 0),
                0
            )
    )

    const shetuanAvg = keepTwoDecimal(
        shetuanM /
            Object.values(members).reduce(
                (p, c) => p + (c?.con['社团'] || 0),
                0
            )
    )

    const keyanAvg = keepTwoDecimal(
        keyanM /
            Object.values(members).reduce(
                (p, c) => p + (c?.con['竞赛'] || 0),
                0
            )
    )

    const studentAvg = keepTwoDecimal(studentM / Object.keys(members).length)

    const sizhengAvg = keepTwoDecimal(sizhengM / Object.keys(members).length)
    const jiaokeAvg = keepTwoDecimal(jiaokeTotal / Object.keys(members).length)

    console.log('studentTotal', studentM)
    console.log('sizhengAvg', dangtuanAvg)
    console.log('jiaokeAvg', shetuanAvg)

    let sheet = [
        {
            资源: '房屋折旧',
            总费用: fangwu,
            分配标准总数: `${squareCount.total}平方米`,
            院长办: `${squareCount.data['president'].v}`,
            院长办费用: `${squareCount.data['president'].fee}`,
            学院办: `${squareCount.data['collegeDirector'].v}`,
            学院办费用: `${squareCount.data['collegeDirector'].fee}`,
            教科办: `${squareCount.data['studyDirector'].v}`,
            教科办费用: `${squareCount.data['studyDirector'].fee}`,
            学工办: `${squareCount.data['staffDirector'].v}`,
            学生管理: data['学生管理']['房屋折旧'],
            党团建设: data['党团建设']['房屋折旧'],
            社团管理: data['社团管理']['房屋折旧'],
            科研竞赛: data['科研竞赛']['房屋折旧'],
            思政课程教学: data['思政课程教学']['房屋折旧'],
            学工办合计: `${squareCount.data['staffDirector'].fee}`,
            比例: '(2:1:1:1:1)',
        },
        {
            资源: '设备折旧',
            总费用: shebei,
            分配标准总数: `${deviceCount.total}台`,
            院长办: `${deviceCount.data['president'].v}`,
            院长办费用: `${deviceCount.data['president'].fee}`,
            学院办: `${deviceCount.data['collegeDirector'].v}`,
            学院办费用: `${deviceCount.data['collegeDirector'].fee}`,
            教科办: `${deviceCount.data['studyDirector'].v}`,
            教科办费用: `${deviceCount.data['studyDirector'].fee}`,
            学工办: `${deviceCount.data['staffDirector'].v}`,
            学生管理: data['学生管理']['设备折旧'],
            党团建设: data['党团建设']['设备折旧'],
            社团管理: data['社团管理']['设备折旧'],
            科研竞赛: data['科研竞赛']['设备折旧'],
            思政课程教学: data['思政课程教学']['设备折旧'],
            学工办合计: `${deviceCount.data['staffDirector'].fee}`,
            比例: '(2:1:1:1:1)',
        },
        {
            资源: '水电费',
            总费用: shui,
            分配标准总数: `${waterCount.total}平方米`,
            院长办: `${waterCount.data['president'].v}`,
            院长办费用: `${waterCount.data['president'].fee}`,
            学院办: `${waterCount.data['collegeDirector'].v}`,
            学院办费用: `${waterCount.data['collegeDirector'].fee}`,
            教科办: `${waterCount.data['studyDirector'].v}`,
            教科办费用: `${waterCount.data['studyDirector'].fee}`,
            学工办: `${waterCount.data['staffDirector'].v}`,
            学生管理: data['学生管理']['水电费'],
            党团建设: data['党团建设']['水电费'],
            社团管理: data['社团管理']['水电费'],
            科研竞赛: data['科研竞赛']['水电费'],
            思政课程教学: data['思政课程教学']['水电费'],
            学工办合计: `${waterCount.data['staffDirector'].fee}`,
            比例: '(2:1:1:1:1)',
        },
        {
            资源: '办公费用',
            总费用: bangong,
            分配标准总数: `${peopleCount.total}人`,
            院长办: `${peopleCount.data['president'].v}`,
            院长办费用: `${peopleCount.data['president'].fee}`,
            学院办: `${peopleCount.data['collegeDirector'].v}`,
            学院办费用: `${peopleCount.data['collegeDirector'].fee}`,
            教科办: `${peopleCount.data['studyDirector'].v}`,
            教科办费用: `${peopleCount.data['studyDirector'].fee}`,
            学工办: `${peopleCount.data['staffDirector'].v}`,
            学生管理: data['学生管理']['办公费用'],
            党团建设: data['党团建设']['办公费用'],
            社团管理: data['社团管理']['办公费用'],
            科研竞赛: data['科研竞赛']['办公费用'],
            思政课程教学: data['思政课程教学']['办公费用'],
            学工办合计: `${peopleCount.data['staffDirector'].fee}`,
            比例: '(2:1:1:1:1)',
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
            比例: '(2:1:1)',
        },
        {
            资源: '共同体系统',
            总费用: gongtong,
            学生管理: data['学生管理']['共同体系统'],
            学工办合计: data['学生管理']['共同体系统'],
        },
        {
            资源: '实验耗材',
            总费用: shiyan,
            科研竞赛: data['科研竞赛']['实验耗材'],
            学工办合计: data['科研竞赛']['实验耗材'],
        },
        {
            资源: '学院管理',
            总费用: data['学院管理'].total,
            教科办: peopleCount.data['studyDirector'].v,
            教科办费用: data['教学事务管理']['学院管理'],
            学生管理: data['学生管理']['学院管理'],
            党团建设: data['党团建设']['学院管理'],
            社团管理: data['社团管理']['学院管理'],
            科研竞赛: data['科研竞赛']['学院管理'],
            思政课程教学: data['思政课程教学']['学院管理'],
            学工办合计:
                data['学生管理']['学院管理'] +
                data['党团建设']['学院管理'] +
                data['社团管理']['学院管理'] +
                data['科研竞赛']['学院管理'] +
                data['思政课程教学']['学院管理'],
        },

        ...Object.values(salary).flatMap((v) => {
            return Object.entries(v.gangwei.data).map(([k, v1]) => {
                console.log('kv', k, v1)
                if (k.match(/赵/)) {
                    return {
                        工资: k,
                        总费用: v1,
                        学生管理: keepTwoDecimal((2 / 3) * v1),
                        科研竞赛: keepTwoDecimal((1 / 3) * v1),
                    }
                }
                if (k.match(/何/)) {
                    return {
                        工资: k,
                        总费用: v1,
                        学生管理: keepTwoDecimal((2 / 3) * v1),
                        党团建设: keepTwoDecimal((1 / 3) * v1),
                    }
                }
                if (k.match(/周/)) {
                    return {
                        工资: k,
                        总费用: v1,
                        学生管理: keepTwoDecimal((2 / 3) * v1),
                        社团管理: keepTwoDecimal((1 / 3) * v1),
                    }
                }
                return {
                    工资: k,
                    总费用: v1,
                }
            })
        }),
        ...Object.values(salary).flatMap((v) => {
            return Object.entries(v.shouke.data).map(([k, v]) => {
                return {
                    工资: k,
                    总费用: v,
                    思政课程教学: v,
                }
            })
        }),
        {
            资源: '作业成本归集',
            教科办费用: jiaokeTotal,
            学生管理: studentM,
            党团建设: dangtuanM,
            社团管理: shetuanM,

            科研竞赛: keyanM,

            思政课程教学: sizhengM,

            学工办合计: studentM + dangtuanM + shetuanM + keyanM + sizhengM,
        },
        {
            资源: '受益对象人数',
            教科办费用: Object.keys(members).length,
            学生管理: Object.keys(members).length,
            思政课程教学: Object.keys(members).length,
            科研竞赛: Object.values(members).reduce(
                (p, c) => p + (c?.con['竞赛'] || 0),
                0
            ),
            社团管理: Object.values(members).reduce(
                (p, c) => p + (c?.con['社团'] || 0),
                0
            ),
            党团建设: Object.values(members).reduce(
                (p, c) => p + (c?.con['党团'] || 0),
                0
            ),
        },
        {
            资源: '服务',
            教科办费用: jiaokeAvg,
            学生管理: studentAvg,
            党团建设: dangtuanAvg,
            社团管理: shetuanAvg,

            科研竞赛: keyanAvg,

            思政课程教学: sizhengAvg,
        },

        {
            资源: '细分',
        },
        ...Object.entries(members).map(([name, member]) => {
            return {
                工资: member.name,
                总费用:
                    (member.con['竞赛'] || 0) * keyanAvg +
                    (member.con['社团'] || 0) * shetuanAvg +
                    (member.con['党团'] || 0) * dangtuanAvg +
                    jiaokeAvg +
                    studentAvg +
                    sizhengAvg,
            }
        }),
    ]

    sheet = [headerDisplay, ...sheet]

    const worksheet = xlsx.utils.json_to_sheet(sheet, {
        header: header,
        skipHeader: true,
    })

    const colsconfig = []
    Object.keys(header).forEach((key) => {
        colsconfig.push({
            wch: 15,
        })
    })

    worksheet['!cols'] = colsconfig //设置列属性

    console.log(worksheet)
    Object.keys(worksheet).forEach((key) => {
        //设置单元格属性
        if (key.indexOf('!') < 0) {
            worksheet[key].s = {
                alignment: {
                    horizontal: 'center',
                    vertical: 'center',
                    wrapText: true,
                },
                border: {
                    left: { style: 'thin' },
                    right: { style: 'thin' },
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                },
            }
            console.log(worksheet[key])
        }
    })

    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, worksheet, 'Sheet1')
    const exportData = workbook2blob(wb, header)
    // 将data 映射为 xlsx文件
    fileDownload(exportData, 'export.xlsx')
}

function workbook2blob(workbook) {
    // 生成excel的配置项
    const wopts = {
        // 要生成的文件类型
        bookType: 'xlsx',
        // // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        bookSST: false,
        type: 'binary',
    }

    const wbout = xlsx.write(workbook, wopts)
    // 将字符串转ArrayBuffer
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length)
        const view = new Uint8Array(buf)
        for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
        return buf
    }
    const blob = new Blob([s2ab(wbout)], {
        type: 'application/octet-stream',
    })
    return blob
}
