import * as xlsx from 'xlsx'

export const parseXLSXFile = (path) => {
    console.log(path)
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        console.log(reader)

        reader.readAsDataURL(path)
        reader.onload = (e) => {
            const data = e.target.result
            const workbook = xlsx.read(data, { type: 'binary' })
            console.log(workbook.Sheets)
            resolve(workbook)
        }
    })
}

export const exportXLSXFile = (data) => {
    const workBook = {
        SheetNames: ['Sheet1'],
        Sheets: {},
        Props: {},
    }

    workBook.Sheets['Sheet1'] = xlsx.utils.json_to_sheet(data)
    saveAs(
        new Blob([changeData(XLSX.write(workBook, wopts))], {
            type: 'application/octet-stream',
        })
    )
}

function changeData(s) {
    //如果存在ArrayBuffer对象(es6) 最好采用该对象
    if (typeof ArrayBuffer !== 'undefined') {
        //1、创建一个字节长度为s.length的内存区域
        const buf = new ArrayBuffer(s.length)

        //2、创建一个指向buf的Unit8视图，开始于字节0，直到缓冲区的末尾
        const view = new Uint8Array(buf)

        //3、返回指定位置的字符的Unicode编码
        for (const i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
        return buf
    } else {
        const buf = new Array(s.length)
        for (const i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xff
        return buf
    }
}

function saveAs(obj, fileName) {
    //当然可以自定义简单的下载文件实现方式

    const tmpa = document.createElement('a')

    tmpa.download = fileName || '下载'
    tmpa.href = URL.createObjectURL(obj) //绑定a标签
    tmpa.click() //模拟点击实现下载

    setTimeout(function () {
        //延时释放
        URL.revokeObjectURL(obj) //用URL.revokeObjectURL()来释放这个object URL
    }, 100)
}
