// 四舍五入保留两位小数
export function keepTwoDecimal(num) {
    let result = parseFloat(num)
    if (isNaN(result)) {
        return NaN
    }
    result = Math.round(num * 100) / 100
    return result
}
