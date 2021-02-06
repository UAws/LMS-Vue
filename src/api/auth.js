import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'http://localhost:8080/auth/login',
    method: 'post',
    data
  })
}
