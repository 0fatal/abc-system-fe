export const userList = [
    {
        username: 'p001',
        password: '123456',
        nickname: '主任',
        role: 'president',
    },
    {
        username: 'p002',
        password: '123456',
        nickname: '主任',
        role: 'director',
    },
    {
        username: 'p003',
        password: '123456',
        nickname: '老师',
        role: 'teacher',
    },
]

export const doLogin = (username, password) => {
    const user = userList.find(
        (item) => item.username === username && item.password === password
    )
    console.log(user)
    return user
}
