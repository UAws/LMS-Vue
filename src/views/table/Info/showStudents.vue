<template>
  <div class="app-container">

    <div class="filter-container" style="margin-bottom: 20px">

      <el-select v-model="listQuery.roleOption" placeholder="UserLevel" clearable style="width: 150px" class="filter-item">
        <el-option v-for="item in roleQueryOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-left: 10px" @click="handleFilter">
        Search
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
      <el-checkbox v-model="showDebugField" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        DebugField
      </el-checkbox>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.userId }}
        </template>
      </el-table-column>
      <el-table-column label="Name" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column v-if="showDebugField" label="Password" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.password }}</span>
        </template>
      </el-table-column>
      <el-table-column label="User Role" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.title }}
        </template>
      </el-table-column>
      <el-table-column label="is Active" width="110" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.isActive | statusFilter">
            <div v-if="row.isActive === true">Active</div>
            <div v-else-if="row.isActive === false">Disable</div>
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column v-if="showDebugField" align="center" prop="created_at" label="User Role ID" width="150">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          <span>{{ scope.row.userLevel }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Subjects" align="center" width="200">
        <template slot-scope="{row}">
          <el-button v-if="row.belongedSubjects !== undefined && row.belongedSubjects.length > 0" el-button type="info" round @click="handleShowSubject(row.belongedSubjects)">
            {{ row.belongedSubjects.length }}
          </el-button>
          <el-button v-else type="info" round>
            0
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="Actions" align="center" width="250">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button v-if="row.isActive === false" size="small" type="success" @click="handleModifyStatus(row,'Active')">
            Active
          </el-button>
          <el-button v-if="row.isActive === true" size="small" @click="handleModifyStatus(row,'Disable')">
            Disable
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="Name" prop="Name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="PWD" prop="Password">
          <el-input v-model="temp.password" />
        </el-form-item>

        <el-form-item label="Role">
          <el-select v-model="temp.title" class="filter-item" placeholder="Please select">
            <el-option v-for="item in roleOption" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="Availability">
          <el-switch v-model="temp.isActive" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible="dialogSubjectVisible" title="Enrolled Subjects" @close="dialogSubjectVisible = false">
      <el-table :data="currentPersonSubjectData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="subjectId" label="Subject Id" />
        <el-table-column prop="name" label="Subject Name" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogSubjectVisible = false">Confirm</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
// import { getList } from '@/api/table'
import { changePeopleActive, deletePeople, getPeopleByRoleID, getPeopleList, updatePeople } from '@/api/userInfo'
export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        true: 'success',
        false: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [{
        // isActive: 1
      }],
      listLoading: true,
      temp: {
        isActive: true,
        name: 'TestUser',
        password: '123456',
        title: 'Student',
        userId: 7,
        userLevel: 1,
        belongedSubjects: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      roleOption: ['Student', 'Tutor', 'Lecturer'],
      roleQueryOptions: ['All', 'Student', 'Tutor', 'Lecturer'],
      listQuery: {
        roleOption: 'All'
      },
      tableKey: 1,
      showDebugField: false,
      dialogSubjectVisible: false,
      currentPersonSubjectData: []
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getPeopleList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    handleModifyStatus: function(row, status) {
      if (status === 'Disable') {
        row.isActive = false
      } else if (status === 'Active') {
        row.isActive = true
      }

      // eslint-disable-next-line no-unused-vars
      changePeopleActive(row).then(response => {
        if (response.code === 20000) {
          this.$message({
            message: 'DB Success',
            type: 'success'
          })
        } else {
          this.$message({
            message: response.msg,
            type: 'error'
          })
        }
      })
    },
    handleDelete(row, index) {
      this.$notify({
        Name: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })

      this.$confirm(
        'Are you sure to remove user : ' +
        row.name + ' With ID : ' + row.userId, 'Warning', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Stop',
          type: 'warning'
        }).then(() => {
        deletePeople(row.userId).then(response => {
          if (response.code === 20000) {
            this.$message({
              message: 'DB Success',
              type: 'success'
            })
          } else {
            this.$message({
              message: response.msg,
              type: 'error'
            })
          }
          this.list.splice(index, 1)
        })
      }).catch(() => {
        this.$message({
          message: 'User Cancelled',
          type: 'error'
        })
      })
    },
    resetTemp() {
      this.temp = {
        isActive: true,
        name: 'TestUser',
        password: '-1',
        title: 'Student',
        userId: 0,
        userLevel: 1,
        belongedSubjects: []
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)

          delete tempData.belongedSubjects
          switch (tempData.title) {
            case 'Student':
              tempData.userLevel = 1
              break
            case 'Tutor':
              tempData.userLevel = 2
              break
            case 'Lecturer':
              tempData.userLevel = 3
              break
          }
          updatePeople(tempData).then((response) => {
            this.list.push(response.data)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)

          delete tempData.belongedSubjects
          switch (tempData.title) {
            case 'Student':
              tempData.userLevel = 1
              break
            case 'Tutor':
              tempData.userLevel = 2
              break
            case 'Lecturer':
              tempData.userLevel = 3
              break
          }
          updatePeople(tempData).then((response) => {
            const index = this.list.findIndex(v => v.userId === tempData.userId)
            this.list.splice(index, 1, response.data)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleFilter() {
      let roleId
      switch (this.listQuery.roleOption) {
        case 'Student':
          roleId = 1
          break
        case 'Tutor':
          roleId = 2
          break
        case 'Lecturer':
          roleId = 3
          break
      }

      if (roleId !== undefined) {
        getPeopleByRoleID(roleId).then((response) => {
          this.list = response.data
        })
      } else {
        this.fetchData()
      }
    },
    handleShowSubject: function(subjects) {
      if (subjects.length > 0) {
        subjects.sort((a, b) => a.subjectId - b.subjectId)
        this.currentPersonSubjectData = subjects
        this.dialogSubjectVisible = true
      }
    }
  }
}
</script>

<style>
body .el-table th {
  display: table-cell !important;
}
</style>
