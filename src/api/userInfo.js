import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/vue-admin-template/table/list',
    method: 'get',
    params
  })
}

export function getPeopleList(params) {
  return request({
    url: 'http://localhost:8080/people/',
    method: 'get',
    params
  })
}

export function changePeopleActive(data) {
  return request({
    url: 'http://localhost:8080/people/',
    method: 'post',
    data
  })
}

export function deletePeople(id) {
  return request({
    url: `http://localhost:8080/people/id/${id}`,
    method: 'delete'
  })
}

export function updatePeople(data) {
  return request({
    url: 'http://localhost:8080/people/',
    method: 'post',
    data
  })
}

export function getPeopleByRoleID(roleId) {
  return request({
    url: `http://localhost:8080/people/role/${roleId}`,
    method: 'get'
  })
}

