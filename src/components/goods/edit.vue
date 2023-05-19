<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="修改商品信息" type="warning" show-icon :closable="false" center> </el-alert>

      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-tabs tab-position="left" v-model="activeIndex" :before-leave="beforeTapLeave" @tab-click="tabClicked">
          <el-tab-pane label="基本信息" name="0">
            <h3>基本信息</h3>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="editForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="editForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="editForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader v-model="editForm.goods_cat" :options="cateList" :props="cascaderProps" @change="handleChange" clearable> </el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <h3>商品参数</h3>
            <el-form-item v-for="item in manyData" :key="item.attr_id" :label="item.attr_name + `：`">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(value, i) in item.attr_vals" :key="i" :label="value" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">
            <h3>商品属性</h3>
            <el-form-item v-for="item in onlyData" :key="item.attr_id" :label="item.attr_name + `：`">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品图片" name="3">
            <h3>商品图片</h3>
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" 
            list-type="picture" :headers="headerObj" :on-success="handleSuccess" :file-list="fileList">
              <el-button type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>

          <el-tab-pane label="商品内容" name="4">
            <h3>商品内容</h3>
            <quill-editor v-model="editForm.goods_introduce" />
            <el-button type="primary" class="addBtn" @click="editGoods">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片的预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="30%" class="pre-dialog">
      <img :src="previewPath" alt="" class="pre-img" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: '0',
      editForm: {
        goods_name: '',
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: [],
      },
      editFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
      },
      cateList: [],
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover',
      },
      manyData: [],
      onlyData: [],
      uploadURL: 'http://www.tangxiaoyang.vip:8888/api/v2/upload',
      headerObj: {
        Authorization: JSON.parse(sessionStorage.getItem('userInfo')).token,
      },
      previewVisible: false,
      previewPath: '',
      fileList:[]
    }
  },
  created() {
    this.getGoodsById()
    this.getCateList()
  },
  methods: {
    async getGoodsById() {
      const { data: res } = await this.$http.get(`goods/${this.$route.query.id}`)
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品信息失败')
      }
      res.data.goods_cat = res.data.goods_cat.split(',').map(item => {
        return item * 1
      })

      res.data.pics.forEach(item => {
        this.fileList.push( {
          name:item.pics_id,
          url:item.pics_big_url.replace('127.0.0.1','www.tangxiaoyang.vip'),
          tmp_path:item.pics_big
        })

        item.pic = item.pics_big
      })

      this.editForm = res.data
      // console.log(res)
    },
    async getCateList() {
      const { data: res } = await this.$http.get(`categories`)
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类列表失败')
      }
      //   console.log(res.data)
      this.cateList = res.data
      //   console.log(this.cateList)
    },
    handleChange() {
      if (this.editForm.goods_cat.length !== 3) {
        this.editForm.goods_cat = []
        this.$message.error('请先选择商品的三级分类')
      }
    },
    beforeTapLeave() {
      if (this.editForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品的分类')
        return false
      }

    },
    async tabClicked() {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' },
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数失败')
        }
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        this.manyData = res.data
        // console.log(res.data)
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' },
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态睡醒失败')
        }
        this.onlyData = res.data
      }
    },
    handleRemove(file) {
      //   console.log(file, fileList)
      const filePath = file.tmp_path || file.response.data.tem_path
      const i = this.editForm.pics.findIndex((item) => {
        item.pic == filePath
      })
      this.editForm.pics.splice(i, 1)
      console.log(this.editForm.pics)
    },
    handlePreview(file) {
      this.previewVisible = true
      this.previewPath = file.url
    },
    handleSuccess(response) {
      this.editForm.pics.push({
        pic: response.data.tmp_path,
      })
      // console.log(this.editForm.pics)
    },
    editGoods() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }

        const form = _.cloneDeep(this.editForm) // 深拷贝
        form.goods_cat = form.goods_cat.join(',')

        this.manyData.forEach((item) => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(','),
          })
        })

        this.onlyData.forEach((item) => {
          form.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })

        const { data:res } = await this.$http.put(`goods/${this.editForm.goods_id}`,form)
        if(res.meta.status !== 200) {
          return this.$message.error('修改商品失败')
        }
        this.$message.success('修改商品成功')
        this.$router.push('/goods')
      })
    },
  },
  computed: {
    cateId() {
      return this.editForm.goods_cat.length === 3 ? this.editForm.goods_cat[2] : null
    },
  },
}
</script>

<style lang="scss">
.el-steps {
  margin: 20px;
}
.el-tab-pane {
  height: 100%;
}
.el-form-item {
  text-align: left;
}
.pre-img {
  width: 100%;
}
.addBtn {
  width: 100%;
  margin-top: 20px;
}
</style>