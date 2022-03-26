import { parseXLSXFile } from './myxlsx'

// {
//     "1": {
//       "con": {
//         "竞赛": 3,
//         "党团": 1,
//         "社团": 1,
//         "全院名单": 1
//       },
//       "name": "A"
//     },
//     "2": {
//       "con": {
//         "竞赛": 1,
//         "党团": 1,
//         "社团": 2,
//         "全院名单": 1
//       },
//       "name": "B"
//     }
// }

export const importUser = (workbook) => {
    const user = JSON.parse(localStorage.getItem('user'))
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return user
}
