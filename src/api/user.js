import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'http://localhost:8080/auth/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-admin-template/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: 'http://localhost:8080/auth/logout',
    method: 'post'
  })
}
