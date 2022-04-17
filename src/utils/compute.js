import { roleMap } from '@/role/role'
import * as xlsx from 'xlsx'
import { workbook2blob } from './myxlsx'
import { keepTwoDecimal } from './num'
import { fetchStore } from './storage'
import { uploadFile } from './upload'
const fileDownload = require('js-file-download')

// 取出成员名单
const fetchMember = () => {
    return fetchStore('abc/member')
}

// 取出学院资源
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

// 通过资源名字取出每个角色的资源
const fetchAssetsByAsset = (asset) => {
    const data = {}
    for (const role in roleMap) {
        data[role] = fetchStore(`abc/${role}/assets/${asset}`)
    }
    return data
}

// 通过分配标准名字取出分配标准，totalFee是总费用，比如房屋折旧总费用，然后此函数能够自动计算在某方面的权重和费用，以及平均值
const fetchStandardByKey = (key, totalFee) => {
    const data = fetchAssetsByAsset('standard')
    const res = { data: {}, total: 0 }

    // 每个角色的分配标准
    for (const role in data) {
        res.data[role] = {}
        const item = data[role]
        res.data[role].v = Number(item.find((v) => v.name === key).value || 0)
        res.total += res.data[role].v // 总数量
    }
    res['avg'] = keepTwoDecimal(res.total / Object.keys(data).length) // 平均值

    // 计算每块的权重和费用
    for (const role in data) {
        res.data[role].w = res.data[role].v / res.total
        if (totalFee) {
            res.data[role].fee = keepTwoDecimal(res.data[role].w * totalFee)
        }
    }
    return res
}

//  获取工资，分为岗位工资和授课工资
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
                // 注意，“岗位”是用来哪个工资的
                res[k].gangwei.data[v.name] = Number(v.value)
                res[k].gangwei.total += Number(v.value)
            } else {
                // 每个角色的总授课工资
                res[k].shouke.data[v.name] = v.value
                res[k].shouke.total += v.value
            }
        })
        res[k].total = res[k].gangwei.total + res[k].shouke.total
    })
    return res
}

// 数据处理核心过程1
const processData = () => {
    // 学院资源
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

    // 设备资源
    let deviceCount = fetchStandardByKey('设备数量（台）', shebei)
    let peopleCount = fetchStandardByKey('人数（人）', bangong) // 人数
    // let waterCount = fetchStandardByKey('水电用量（平方米', shui) // 水电费
    let squareCount = fetchStandardByKey('房屋面积（平方米）', fangwu) // 房屋面积

    console.log('deviceCount', deviceCount)
    console.log('peopleCount', peopleCount)
    console.log('squareCount', squareCount)

    // 薪水
    const salary = fetchSalary()

    console.log('salary', salary)
    console.log(
        peopleCount.data['president'],
        peopleCount.data['collegeDirector']
    )

    // 计算每块分类的费用
    const computeFeeClassify = () => {
        const res = {}

        const r = fetchStore('abc/staffDirector/rate')
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
                (r.X1 / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (r.X1 / r.T1) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (r.X1 / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: keepTwoDecimal(
                (r.X2 / r.T2) *
                    salary['staffDirector'].gangwei.data['赵老师岗位工资'] +
                    (r.X3 / r.T3) *
                        salary['staffDirector'].gangwei.data['何老师岗位工资'] +
                    (r.X4 / r.T4) *
                        salary['staffDirector'].gangwei.data['周老师岗位工资']
            ),
            办公费用: keepTwoDecimal(
                (r.X1 / r.T1) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            // TODO X5 T5
            活动经费: keepTwoDecimal((r.X5 / r.T5) * huodong),
            共同体系统: gongtong,
            学院管理: keepTwoDecimal(
                (((r.X1 / r.T1) * peopleCount.data['staffDirector'].v) /
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
            res['学生管理']['共同体系统'] +
            res['学生管理']['学院管理']

        // 学生管理
        res['思政课程教学'] = {
            房屋折旧: keepTwoDecimal(
                (r.E / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (r.E / r.T1) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (r.E / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: salary['staffDirector'].shouke.total,
            办公费用: keepTwoDecimal(
                (r.E / r.T1) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            学院管理: keepTwoDecimal(
                (((r.E / r.T1) * peopleCount.data['staffDirector'].v) /
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
                (r.S1 / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (r.S1 / r.T1) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (r.S1 / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: keepTwoDecimal(
                (r.S2 / r.T2) *
                    salary['staffDirector'].gangwei.data['赵老师岗位工资'] +
                    (r.S3 / r.T3) *
                        salary['staffDirector'].gangwei.data['何老师岗位工资'] +
                    (r.S4 / r.T4) *
                        salary['staffDirector'].gangwei.data['周老师岗位工资']
            ),
            办公费用: keepTwoDecimal(
                (r.S1 / r.T4) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            活动经费: keepTwoDecimal((r.S5 / r.T5) * huodong),
            学院管理: keepTwoDecimal(
                (((r.S1 / r.T1) * peopleCount.data['staffDirector'].v) /
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
                (r.K1 / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (r.K1 / r.T1) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (r.K1 / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: keepTwoDecimal(
                (r.K2 / r.T2) *
                    salary['staffDirector'].gangwei.data['赵老师岗位工资'] +
                    (r.K3 / r.T3) *
                        salary['staffDirector'].gangwei.data['何老师岗位工资'] +
                    (r.K4 / r.T4) *
                        salary['staffDirector'].gangwei.data['周老师岗位工资']
            ),
            办公费用: keepTwoDecimal(
                (r.K1 / r.T1) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            实验耗材: shiyan,
            活动经费: keepTwoDecimal((r.K5 / r.T5) * huodong),
            学院管理: keepTwoDecimal(
                (((r.K1 / r.T1) * peopleCount.data['staffDirector'].v) /
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
            res['科研竞赛'].学院管理 +
            res['科研竞赛'].活动经费

        res['党团建设'] = {
            房屋折旧: keepTwoDecimal(
                (r.D1 / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    fangwu
            ),
            设备折旧: keepTwoDecimal(
                (r.D1 / r.T1) *
                    (deviceCount.data['staffDirector'].v / deviceCount.total) *
                    shebei
            ),
            水电费: keepTwoDecimal(
                (r.D1 / r.T1) *
                    (squareCount.data['staffDirector'].v / squareCount.total) *
                    shui
            ),
            行政老师工资: keepTwoDecimal(
                (r.D2 / r.T2) *
                    salary['staffDirector'].gangwei.data['赵老师岗位工资'] +
                    (r.D3 / r.T3) *
                        salary['staffDirector'].gangwei.data['何老师岗位工资'] +
                    (r.D4 / r.T4) *
                        salary['staffDirector'].gangwei.data['周老师岗位工资']
            ),
            办公费用: keepTwoDecimal(
                (r.D1 / r.T1) *
                    (peopleCount.data['staffDirector'].v / peopleCount.total) *
                    bangong
            ),
            活动经费: keepTwoDecimal((r.D5 / r.T5) * huodong),
            学院管理: keepTwoDecimal(
                (((r.D1 / r.T1) * peopleCount.data['staffDirector'].v) /
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

// 数据处理核心过程2，导出数据
export const exportData = async (preview = false) => {
    const data = processData()

    // 展示的表头，右边才是实际显示的
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

    // 学院资源
    const fangwu = fetchCollegeAssets('房屋折旧')
    const shebei = fetchCollegeAssets('设备折旧')
    const shui = fetchCollegeAssets('水电费')
    const bangong = fetchCollegeAssets('办公费用')
    const shiyan = fetchCollegeAssets('实验耗材')
    const huodong = fetchCollegeAssets('活动经费')
    const gongtong = fetchCollegeAssets('共同体系统')

    // 设备资源
    let deviceCount = fetchStandardByKey('设备数量（台）', shebei)
    let peopleCount = fetchStandardByKey('人数（人）', bangong) // 人数
    let waterCount = fetchStandardByKey('房屋面积（平方米）', shui) // 水电费
    let squareCount = fetchStandardByKey('房屋面积（平方米）', fangwu) // 房屋面积

    // 薪水
    const salary = fetchSalary()
    // 成员名单
    const members = fetchMember()
    console.log(members)

    // 学生管理总计
    const studentM =
        data['学生管理']['活动经费'] +
        data['学生管理']['房屋折旧'] +
        data['学生管理']['设备折旧'] +
        data['学生管理']['共同体系统'] +
        data['学生管理']['行政老师工资'] +
        data['学生管理']['学院管理'] +
        data['学生管理']['办公费用'] +
        data['学生管理']['水电费']

    // 党团建设总计
    const dangtuanM =
        data['党团建设']['活动经费'] +
        data['党团建设']['房屋折旧'] +
        data['党团建设']['设备折旧'] +
        data['党团建设']['行政老师工资'] +
        data['党团建设']['学院管理'] +
        data['党团建设']['办公费用'] +
        data['党团建设']['水电费']

    // 社团管理总计
    const shetuanM =
        data['社团管理']['活动经费'] +
        data['社团管理']['房屋折旧'] +
        data['社团管理']['设备折旧'] +
        data['社团管理']['行政老师工资'] +
        data['社团管理']['学院管理'] +
        data['社团管理']['办公费用'] +
        data['社团管理']['水电费']

    // 科研竞赛总计
    const keyanM =
        data['科研竞赛']['房屋折旧'] +
        data['科研竞赛']['设备折旧'] +
        data['科研竞赛']['水电费'] +
        data['科研竞赛']['行政老师工资'] +
        data['科研竞赛']['学院管理'] +
        data['科研竞赛']['办公费用'] +
        data['科研竞赛']['实验耗材']

    // 思政课程教学总计
    const sizhengM =
        data['思政课程教学']['房屋折旧'] +
        data['思政课程教学']['设备折旧'] +
        data['思政课程教学']['行政老师工资'] +
        data['思政课程教学']['学院管理'] +
        data['思政课程教学']['办公费用'] +
        data['思政课程教学']['水电费']

    // 教科办总计
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

    // 下面是平均值，除以服务人数的，也就是参与党团建设、科研竞赛的的人次
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

    // ========= 导出的sheet =========
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

        // 这是遍历岗位工资
        ...Object.values(salary).flatMap((v) => {
            return Object.entries(v.gangwei.data).map(([k, v1]) => {
                console.log('kv', k, v1)
                // k是老师名字，v1是岗位工资，其他是分配情况
                if (k.match(/赵/)) {
                    // 如果是赵老师
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

        // 这是遍历授课工资
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

    // ======
    sheet = [headerDisplay, ...sheet]

    const worksheet = xlsx.utils.json_to_sheet(sheet, {
        header: header,
        skipHeader: true,
    })

    // ==== 一些表格格式配置，如每格宽度
    const colsconfig = []
    Object.keys(header).forEach((key) => {
        colsconfig.push({
            wch: 15,
        })
    })

    worksheet['!cols'] = colsconfig //设置列属性

    // ====

    Object.keys(worksheet).forEach((key) => {
        //设置单元格属性，但好像不起作用
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
        }
    })

    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, worksheet, 'Sheet1') // 加入sheet
    const exportData = workbook2blob(wb, header)

    // ！！！！！！！！下载文件
    if (preview === true) {
        return await uploadFile(exportData, 'export.xlsx')
    } else {
        fileDownload(exportData, 'export.xlsx') // 这里可以改导出文件名
    }
}

// 作业成本归集
export const exportData1 = async (preview = false) => {
    const data = processData()

    // 展示的表头，右边才是实际显示的
    const headerDisplay = { 作业: '作业', 作业成本归集: '作业成本归集' }

    const header = Object.keys(headerDisplay)

    // ========= 导出的sheet =========
    let sheet = [
        {
            作业: '学院管理',
            作业成本归集: data['学院管理'].total,
        },
        {
            作业: '教学管理费用（教科办）',
            作业成本归集: data['教学事务管理'].total,
        },
        {
            作业: '学生管理',
            作业成本归集: data['学生管理'].total,
        },
        {
            作业: '党团建设',
            作业成本归集: data['党团建设'].total,
        },
        {
            作业: '社团管理',
            作业成本归集: data['社团管理'].total,
        },
        {
            作业: '科研竞赛',
            作业成本归集: data['科研竞赛'].total,
        },
        {
            作业: '思政课程教学',
            作业成本归集: data['思政课程教学'].total,
        },
        {
            作业: ' ',
        },
        {
            作业: '总计',
            作业成本归集:
                data['学院管理'].total +
                data['教学事务管理'].total +
                data['学生管理'].total +
                data['党团建设'].total +
                data['社团管理'].total +
                data['科研竞赛'].total +
                data['思政课程教学'].total,
        },
    ]

    // ======
    sheet = [headerDisplay, ...sheet]

    const worksheet = xlsx.utils.json_to_sheet(sheet, {
        header: header,
        skipHeader: true,
    })

    // ==== 一些表格格式配置，如每格宽度
    const colsconfig = []
    Object.keys(header).forEach((key) => {
        colsconfig.push({
            wch: 20,
        })
    })

    worksheet['!cols'] = colsconfig //设置列属性

    // ====

    Object.keys(worksheet).forEach((key) => {
        //设置单元格属性，但好像不起作用
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
        }
    })

    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, worksheet, '作业成本归集') // 加入sheet
    const exportData = workbook2blob(wb, header)

    // ！！！！！！！！下载文件
    if (preview === true) {
        return await uploadFile(exportData, '1111.xlsx')
    } else {
        fileDownload(exportData, '作业成本归集.xlsx') // 这里可以改导出文件名
    }
}

export const exportData2 = async (preview = false) => {
    const data = processData()

    // 展示的表头，右边才是实际显示的
    const headerDisplay = {
        学号: '学号',
        姓名: '姓名',
        年级: '年级',
        专业: '专业',
        培养成本: '培养成本',
    }

    const header = Object.keys(headerDisplay)

    // 学院资源
    const fangwu = fetchCollegeAssets('房屋折旧')
    const shebei = fetchCollegeAssets('设备折旧')
    const shui = fetchCollegeAssets('水电费')
    const bangong = fetchCollegeAssets('办公费用')
    const shiyan = fetchCollegeAssets('实验耗材')
    const huodong = fetchCollegeAssets('活动经费')
    const gongtong = fetchCollegeAssets('共同体系统')

    // 设备资源
    let deviceCount = fetchStandardByKey('设备数量（台）', shebei)
    let peopleCount = fetchStandardByKey('人数（人）', bangong) // 人数
    let waterCount = fetchStandardByKey('房屋面积（平方米）', shui) // 水电费
    let squareCount = fetchStandardByKey('房屋面积（平方米）', fangwu) // 房屋面积

    // 薪水
    const salary = fetchSalary()
    // 成员名单
    const members = fetchMember()
    console.log(members)

    // 学生管理总计
    const studentM =
        data['学生管理']['活动经费'] +
        data['学生管理']['房屋折旧'] +
        data['学生管理']['设备折旧'] +
        data['学生管理']['共同体系统'] +
        data['学生管理']['行政老师工资'] +
        data['学生管理']['学院管理'] +
        data['学生管理']['办公费用'] +
        data['学生管理']['水电费']

    // 党团建设总计
    const dangtuanM =
        data['党团建设']['活动经费'] +
        data['党团建设']['房屋折旧'] +
        data['党团建设']['设备折旧'] +
        data['党团建设']['行政老师工资'] +
        data['党团建设']['学院管理'] +
        data['党团建设']['办公费用'] +
        data['党团建设']['水电费']

    // 社团管理总计
    const shetuanM =
        data['社团管理']['活动经费'] +
        data['社团管理']['房屋折旧'] +
        data['社团管理']['设备折旧'] +
        data['社团管理']['行政老师工资'] +
        data['社团管理']['学院管理'] +
        data['社团管理']['办公费用'] +
        data['社团管理']['水电费']

    // 科研竞赛总计
    const keyanM =
        data['科研竞赛']['房屋折旧'] +
        data['科研竞赛']['设备折旧'] +
        data['科研竞赛']['水电费'] +
        data['科研竞赛']['行政老师工资'] +
        data['科研竞赛']['学院管理'] +
        data['科研竞赛']['办公费用'] +
        data['科研竞赛']['实验耗材']

    // 思政课程教学总计
    const sizhengM =
        data['思政课程教学']['房屋折旧'] +
        data['思政课程教学']['设备折旧'] +
        data['思政课程教学']['行政老师工资'] +
        data['思政课程教学']['学院管理'] +
        data['思政课程教学']['办公费用'] +
        data['思政课程教学']['水电费']

    // 教科办总计
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

    // 下面是平均值，除以服务人数的，也就是参与党团建设、科研竞赛的的人次
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

    // ========= 导出的sheet =========
    let money = 0
    let sheet = [
        ...Object.entries(members).map(([id, member]) => {
            money +=
                (member.con['竞赛'] || 0) * keyanAvg +
                (member.con['社团'] || 0) * shetuanAvg +
                (member.con['党团'] || 0) * dangtuanAvg +
                jiaokeAvg +
                studentAvg +
                sizhengAvg
            return {
                学号: id,
                姓名: member.name,
                年级: member.grade,
                专业: member.major,
                培养成本:
                    (member.con['竞赛'] || 0) * keyanAvg +
                    (member.con['社团'] || 0) * shetuanAvg +
                    (member.con['党团'] || 0) * dangtuanAvg +
                    jiaokeAvg +
                    studentAvg +
                    sizhengAvg,
            }
        }),
        {
            学号: ' ',
        },
        {
            专业: '总计',
            培养成本: money,
        },
    ]

    // ======
    sheet = [headerDisplay, ...sheet]

    const worksheet = xlsx.utils.json_to_sheet(sheet, {
        header: header,
        skipHeader: true,
    })

    // ==== 一些表格格式配置，如每格宽度
    const colsconfig = []
    Object.keys(header).forEach((key) => {
        colsconfig.push({
            wch: 15,
        })
    })

    worksheet['!cols'] = colsconfig //设置列属性

    // ====

    Object.keys(worksheet).forEach((key) => {
        //设置单元格属性，但好像不起作用
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
        }
    })

    const wb = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(wb, worksheet, '培养成本') // 加入sheet
    const exportData = workbook2blob(wb, header)

    // ！！！！！！！！下载文件

    if (preview === true) {
        return await uploadFile(exportData, '111.xlsx')
    } else {
        fileDownload(exportData, '培养成本.xlsx') // 这里可以改导出文件名
    }
}
