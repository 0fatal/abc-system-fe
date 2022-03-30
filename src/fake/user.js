// 账号表，其中role只能是以下四种，其他随意更改
export const userList = [
    {
        username: 'p001',
        password: '123456',
        nickname: '院长',
        role: 'president',
    },
    {
        username: 'p002',
        password: '123456',
        nickname: '教科办主任',
        role: 'studyDirector',
    },
    {
        username: 'p003',
        password: '123456',
        nickname: '学院办主任',
        role: 'collegeDirector',
    },
    {
        username: 'p004',
        password: '123456',
        nickname: '学工办主任',
        role: 'staffDirector',
    },
]

// 登录，查找是否在账户表内
export const doLogin = (username, password) => {
    const user = userList.find(
        (item) => item.username === username && item.password === password
    )
    console.log(user)
    return user
}
