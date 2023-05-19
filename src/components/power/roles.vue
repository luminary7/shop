<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card style="text-align: left">
      <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>

      <el-table :data="rolesList" stripe border>
        <el-table-column label="明细" type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="{ bdbottom: true, bdtop: i1 == 0, vcenter: true }">
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="{ bdtop: i2 != 0, vcenter: true }">
                  <el-col :span="6">
                    <el-tag closable type="success" @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-clo :span="18">
                    <el-tag closable type="warning" v-for="item3 in item2.children" :key="item3.id" @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                  </el-clo>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>

        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-edit" size="mini" @click="showRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addFormClose">
      <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editFormClose">
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="rightDialogVisible" width="50%" @close="rightDialogClose">
      <el-tree :data="rightList" :props="treeProps" node-key="id" ref="treeRef"
               show-checkbox default-expand-all :default-checked-keys="defaultKeys">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      rightList: [],
      addDialogVisible: false,
      editDialogVisible: false,
      rightDialogVisible: false,
      treeProps: {
        label: 'authName',
        children: 'children',
      },
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      editForm: {
        roleName: '',
        roleDesc: '',
      },
      addFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
      },
      editFormRules: {
        roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        roleDesc: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
      },
      defaultKeys: [],
      // 当前要分配角色的Id
      roleId : null,
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get(`roles`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.rolesList = res.data
      //   console.log(this.rolesList)
    },
    addRole() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(`roles`, this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.addDialogVisible = false
        this.getRolesList()
        this.$message.success('添加角色成功')
      })
    },
    addFormClose() {
      this.$refs.addFormRef.resetFields()
    },
    editFormClose() {
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editRole() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success('修改角色成功')
      })
    },
    removeRoleById(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除角色失败')
          }
          this.getRolesList()
          this.$message.success('删除成功!')
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    removeRightById(role, id) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除权限失败')
          }
          //   this.getRolesList()
          role.children = res.data
          this.$message({
            type: 'success',
            message: '删除权限成功!',
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
    // 显示分配权限的对话框
    async showRightDialog(role) {
        this.roleId = role.id
      // 获取树形权限列表
      const { data: res } = await this.$http.get(`rights/tree`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightList = res.data
      //   console.log(this.rightList)
      // 获取所有三级权限的id
      this.getLeafKeys(role)
      this.rightDialogVisible = true
    },
    getLeafKeys(node) {
      if (!node.children) {
        return this.defaultKeys.push(node.id)
      }
      node.children.forEach((element) => {
        this.getLeafKeys(element)
      })
    },
    // 权限板块的关闭
    rightDialogClose() {
      this.defaultKeys = []
      this.roleId = null
    },
    // 分配权限
    async allotRight() {
        const keys = this.$refs.treeRef.getCheckedKeys().concat(this.$refs.treeRef.getHalfCheckedKeys())
        // console.log(keys)
        const ids = keys.join(',')
        const { data:res } = await this.$http.post(`roles/${this.roleId}/rights`,{
            rids:ids
        })
        if(res.meta.status !== 200) {
          return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.rightDialogVisible = false
    },
  },
}
</script>

<style lang="scss">
.el-tag {
  margin: 6px;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.bdtop {
  border-top: 1px solid #eee;
}
.vcenter {
  // vertical-align: middle;
  display: flex;
  align-items: center;
}
</style>