import * as xlsx from 'xlsx'

// 解析excel文件
export const parseXLSXFile = (path) => {
    console.log(path)
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        console.log(reader)

        reader.onload = (e) => {
            const data = e.target.result
            const workbook = xlsx.read(data, { type: 'binary' })
            console.log(workbook.Sheets)
            resolve(workbook)
        }
        reader.readAsBinaryString(path)
    })
}

export function workbook2blob(workbook) {
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
