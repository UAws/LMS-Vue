import request from '@/utils/request'

export function getSubjectList(params) {
  return request({
    url: 'http://localhost:8080/subject/',
    method: 'get',
    params
  })
}

export function deleteSubject(id) {
  return request({
    url: `http://localhost:8080/subject/id/${id}`,
    method: 'delete'
  })
}

export function updateSubject(data) {
  return request({
    url: 'http://localhost:8080/subject/',
    method: 'post',
    data
  })
}

