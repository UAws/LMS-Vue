<template>
  <div class="app-container">

    <div class="filter-container" style="margin-bottom: 20px">
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.subjectId }}
        </template>
      </el-table-column>
      <el-table-column label="Name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>

      <el-table-column label="People" align="center" width="200">
        <template slot-scope="{row}">

          <!--          https://blog.csdn.net/qq_39343308/article/details/85100219-->

          <el-button v-cloak v-if="row.containedPeople !== undefined && row.containedPeople.length > 0" type="info" round @click="handleShowPeople(row.containedPeople)">
            {{ row.containedPeople.length }}
          </el-button>
          <el-button v-else type="info" round>
            0
          </el-button>
        </template>
      </el-table-column>

      <el-table-column label="Actions" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button v-if="row.isActive!=='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
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

    <el-dialog :visible="dialogPeopleVisible" title="Enrolled Subjects" @close="dialogPeopleVisible = false">
      <el-table :data="currentSubjectPeopleData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="userId" label="User Id" />
        <el-table-column prop="name" label="User Name" />
        <el-table-column prop="title" label="Title" />
        <el-table-column label="Availability" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.isActive | statusFilter">
              <div v-if="row.isActive === true">Active</div>
              <div v-else-if="row.isActive === false">Disable</div>
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPeopleVisible = false">Confirm</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
// import { getList } from '@/api/table'
import { deleteSubject, getSubjectList, updateSubject } from '@/api/subjectInfo'
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
        name: 'subject01',
        subjectId: 0,
        containedPeople: []
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
      currentSubjectPeopleData: [],
      dialogPeopleVisible: false
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getSubjectList().then(response => {
        this.list = response.data
        this.listLoading = false
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
        'Are you sure to remove subject : ' +
        row.name + ' With ID : ' + row.subjectId, 'Warning', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Stop',
          type: 'warning'
        }).then(() => {
        deleteSubject(row.subjectId).then(response => {
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
        containedPeople: [],
        name: 'subject01',
        subjectId: 0
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
          updateSubject(tempData).then((response) => {
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
    updateData(row) {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateSubject(tempData).then((response) => {
            const index = this.list.findIndex(v => v.subjectId === tempData.subjectId)
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
    handleShowPeople: function(peoples) {
      if (peoples.length > 0) {
        peoples.sort((a, b) => a.userId - b.userId)
        this.currentSubjectPeopleData = peoples
        this.dialogPeopleVisible = true
      }
    }
  }
}
</script>
