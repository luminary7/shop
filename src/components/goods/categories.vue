<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-button type="primary" @click="showAddDialog" style="margin-bottom: 20px">添加分类</el-button>

      <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index border>
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-error" style="color: red" v-if="scope.row.cat_deleted"></i>
          <i class="el-icon-success" style="color: lightgreen" v-else></i>
        </template>

        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level == 0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level == 1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>

        <template slot="operate" slot-scope="scope">
          <el-button type="primary" size="mini" class="el-icon-eidt" @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" size="mini" class="el-icon-delete" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

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

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addDialogVisible" @close="addDialogClose">
      <!-- 添加分类表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类" style="text-align: left">
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="handleChange" clearable> </el-cascader>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类" :visible.sync="editDialogVisible" @close="editDialogClose">
      <!-- 添加分类表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 分类列表
      cateList: [],
      // 总记录数
      total: 0,
      // tree-table的列定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'operate',
        },
      ],
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        cat_name: '', // 分类名称
        cat_pid: 0, // 父级分类id
        cat_level: 0, // 分类的等级，默认为一级分类
      },
      editForm: {},
      addFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
      },
      editFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
      },
      parentCateList: [],
      // 选择器的配置对象
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true,
      },
      // 级联选择器选中的id数组
      selectedKeys: [],
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`, {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      //   console.log(res.data)
      this.cateList = res.data.result
      this.total = res.data.total
      //   console.log(this.cateList)
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getCateList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getCateList()
    },
    // 获取父级分类
    async getParentCateList() {
      const { data: res } = await this.$http.get(`categories`, {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
      //   console.log(res)
    },
    // 显示添加分类对话框
    showAddDialog() {
      this.getParentCateList()
      this.addDialogVisible = true
    },
    async showEditDialog(cateId) {
      const { data: res } = await this.$http.get(`categories/${cateId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听级联选择器的改变
    handleChange() {
      // console.log(this.selectedKeys)
      // 判断是否选择了父级分类
      if (this.selectedKeys.length > 0) {
        this.addForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addForm.cat_level = this.selectedKeys.length
      } else {
        this.addForm.cat_pid = 0
        this.addForm.cat_level = 0
      }
    },
    // 添加分类
    addCate() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(`categories`, this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
      })
      this.$message.success('添加分类成功')
      this.getCateList()
      this.getParentCateList()
      this.addDialogVisible = false
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
      this.selectedKeys = []
      this.addForm.cat_level = 0
      this.addForm.cat_pid = 0
    },
    editDialogClose() {
      //   this.$refs.editFormRef.resetFileds()
    },
    editCate() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}`, {
          cat_name: this.editForm.cat_name,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改分类失败')
        }
      })
      this.$message.success('修改分类成功')
      this.getCateList()
      this.editDialogVisible = false
    },
    removeCateById(id) {
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`categories/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除分类失败')
          }
          this.getCateList()
          this.$message({
            type: 'success',
            message: '删除成功!',
          }) 
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
  },
}
</script>

<style lang="scss">
.el-card {
  text-align: left;
}
</style>