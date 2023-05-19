<template>
  <div class="users">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索姓名" v-model="queryInfo.query" class="input-with-select" clearable @clear="getUserList" @keyup.enter.native="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            4
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表 -->
      <el-table :data="users" stripe border>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <!-- 自定义模板，使用作用域插槽 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"> </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-edit" size="mini" @click="showRoleDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
      <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="分配角色" :visible.sync="roleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div style="text-align: left">
        <p>当前用户为：{{ userInfo.username }}</p>
        <p>当前角色为：{{ userInfo.role_name }}</p>
        <p>
          分配新的角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="roleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询用户列表的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      // 存储用户列表数组
      users: [],
      total: 0,
      dialogVisible: false,
      editDialogVisible: false,
      roleDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      editForm: {},
      // 添加用户表单校验
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            pattern: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
            message: '邮箱格式不正确',
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^((1[3,5,8,7,9][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/,
            message: '手机号格式不正确',
            trigger: 'blur',
          },
        ],
      },
      // 修改用户表单校验
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            pattern: /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/,
            message: '邮箱格式不正确',
            trigger: 'blur',
          },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            pattern: /^((1[3,5,8,7,9][0-9])|(14[5,7])|(17[0,6,7,8])|(19[7]))\d{8}$/,
            message: '手机号格式不正确',
            trigger: 'blur',
          },
        ],
      },
      userInfo: {},
      roleList: [],
      selectedRoleId: null,
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.users = res.data.users
      this.total = res.data.total
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getUserList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserList()
    },
    async userStateChange(userInfo) {
      // console.log(userInfo)
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 数据更新失败恢复原始状态
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }

        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status != 201) {
          return this.$message.error('添加用户失败')
        }
        this.dialogVisible = false
        this.getUserList()
        this.$message.success('添加用户成功')
      })
    },
    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile,
        })
        if (res.meta.status != 200) {
          return this.$message.error('修改用户失败')
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('修改用户成功')
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询失败')
      }
      this.editForm = res.data
      // console.log(this.editForm)
      this.editDialogVisible = true
    },
    removeUserById(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`users/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除用户失败')
          }
          this.getUserList()
          this.$message.success('删除成功!')
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    setRoleDialogClosed() {
      this.selectedRoleId = null
      this.userInfo = {}
    },
    async allotRole() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择角色')
      }

      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }

      this.$message.success('更新角色成功！')
      this.getUserList()
      this.roleDialogVisible = false
    },
    async showRoleDialog(userInfo) {
      this.userInfo = userInfo

      const { data: res } = await this.$http.get(`roles`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.roleList = res.data
      console.log(this.rolesList)

      this.roleDialogVisible = true
    },
  },
}
</script>

<style>
</style>