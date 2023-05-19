<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"> </el-alert>
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" @change="handleChange" clearable> </el-cascader>
        </el-col>
      </el-row>

      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" :disabled="btnDisabled" @click="addDialogVisible = true">添加参数</el-button>
          <el-table :data="paramsData" border stripe>
            <el-table-column label="明细" type="expand">
              <!-- 可编辑标签 -->
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable @close="handleClose(scope.row, i)">
                  {{ item }}
                </el-tag>
                <!-- 输入标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="btnDisabled" @click="addDialogVisible = true">添加属性</el-button>
          <el-table :data="paramsData" border stripe>
            <el-table-column label="明细" type="expand">
              <!-- 可编辑标签 -->
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable @close="handleClose(scope.row, i)">
                  {{ item }}
                </el-tag>
                <!-- 输入标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"> </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" size="mini" icon="el-icon-delet" @click="removeParamsById(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数 -->
    <el-dialog :title="`添加` + title" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改参数 -->
    <el-dialog :title="`修改` + title" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 分类列表
      cateList: [],
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
      },
      selectedKeys: [],
      activeName: 'many',
      paramsData: [],
      addDialogVisible: false,
      inputVisible: false,
      addForm: {
        attr_name:''
      },
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      this.cateList = res.data
    },
    handleChange() {
      this.getParamsData()
    },
    handleClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.paramsData = []
        return
      }

      // 根据所选择的分类，获取动态参数或者静态属性
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }

      // 对参数细明进行处理，按照空格拆分为数组
      res.data.forEach((element) => {
        element.attr_vals = element.attr_vals ? element.attr_vals.split(',') : []
        element.inputVisible = false // 每个文本框都有独立的显示和隐藏
        element.inputValue = ''
      })

      this.paramsData = res.data
      console.log(res.data)
    },
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName,
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.addDialogVisible = false
        this.getParamsData()
        this.$message.success('添加参数成功!')
      })
    },
    removeParamsById(id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error('删除参数列表失败')
          }
          this.$message.success('删除参数成功')
          this.getParamsData()
        })
        .catch(() => {
          this.$message.info('已取消删除')
        })
    },
    editDialogClose() {
      this.$refs.editFormRef.resetFields()
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
        params: { att_sel: this.activeName },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('查询参数信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName,
          attr_vals: this.editForm.attr_vals,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败')
        }
        this.getParamsData()
        this.$message.success('修改参数成功')
        this.editDialogVisible = false
      })
    },
    handleClose(row, i) {
      row.attr_vals.splice(i, 1)
      this.updateParamsDetail(row)
    },
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm(row) {
      if (row.inputValue.trim()) {
        row.attr_vals.push(row.inputValue.trim())
        // 更新参数细明
        this.updateParamsDetail(row)
      }
      row.inputVisible = false
      row.inputValue = ''
    },
    async updateParamsDetail(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(','),
      })
      if (res.meta.status !== 200) {
        row.attr_vals.pop()
        return this.$message.error('更新参数明细失败')
      }
      this.$message.success('更新参数明细成功')
    },
  },
  computed: {
    cateId() {
      return this.selectedKeys.length === 3 ? this.selectedKeys[2] : null
    },
    btnDisabled() {
      return !(this.selectedKeys.length === 3)
    },
    title() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    },
  },
}
</script>

<style lang="scss">
.el-col,
.el-tab-pane {
  text-align: left;
}
.el-alert {
  margin-bottom: 20px;
}
.el-tag {
  margin:10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: middle;
}
</style>