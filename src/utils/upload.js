import * as qiniu from 'qiniu-js'
import CryptoES from 'crypto-es'

const accessKey = 'pBMT1ZU--PnUbI2HslUZuQQOdglYJhNLGL65H7JA'
const secretKey = 'o8Ag2Z5UhCd2-AJ-eiTXtFKhBl5f06776LODielf'

var base64EncodeChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function base64encode(str) {
    var out, i, len
    var c1, c2, c3
    len = str.length
    i = 0
    out = ''
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2)
            out += base64EncodeChars.charAt((c1 & 0x3) << 4)
            out += '=='
            break
        }
        c2 = str.charCodeAt(i++)
        if (i == len) {
            out += base64EncodeChars.charAt(c1 >> 2)
            out += base64EncodeChars.charAt(
                ((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4)
            )
            out += base64EncodeChars.charAt((c2 & 0xf) << 2)
            out += '='
            break
        }
        c3 = str.charCodeAt(i++)
        out += base64EncodeChars.charAt(c1 >> 2)
        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4))
        out += base64EncodeChars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6))
        out += base64EncodeChars.charAt(c3 & 0x3f)
    }
    return out
}

function hmacSha1(encodedFlags, secretKey) {
    return CryptoES.HmacSHA1(encodedFlags, secretKey).toString(
        CryptoES.enc.Base64
    )
}

function utf16to8(str) {
    var out, i, len, c
    out = ''
    len = str.length
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i)
        if (c >= 0x0001 && c <= 0x007f) {
            out += str.charAt(i)
        } else if (c > 0x07ff) {
            out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f))
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f))
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f))
        } else {
            out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f))
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f))
        }
    }
    return out
}

const urlsafencode = (jsonFlags) => {
    return jsonFlags.replace(/\//g, '_').replace(/\+/g, '-')
}

export const uploadFile = (file, filename) => {
    const bucket = `abc-system-fe:tmp/${filename}`

    return new Promise((resolve, reject) => {
        const options = {
            scope: bucket,
            deadline: Math.floor(new Date().getTime() / 1000) + 3600,
            returnBody: `{
                \"name\":$(fname),
                \"size\":$(fsize),
                \"hash\":$(etag)
               }`,
        }

        const putPolicy = JSON.stringify(options)
        console.log(putPolicy)
        const encodedPutPolicy = base64encode(utf16to8(putPolicy))
        const sign = hmacSha1(encodedPutPolicy, secretKey)
        const encodedSign = urlsafencode(sign)

        const token = accessKey + ':' + encodedSign + ':' + encodedPutPolicy

        const putExtra = {
            fname: '', // 文件原文件名
            params: {}, // 用来放置自定义变量
            mimeType: null, // 用来限制上传文件类型，为 null 时表示不对文件类型限制；eg: ["image/png", "image/jpeg"]
        }

        const task = qiniu.upload(file, `tmp/${filename}`, token, putExtra, {
            region: null,
            useCdnDomain: true,
        })

        const subscription = task.subscribe(null, null, (res) => {
            resolve(
                `https://view.officeapps.live.com/op/view.aspx?src=http://rags2xebj.hd-bkt.clouddn.com/tmp/${filename}`
            )
        })
    })
}
