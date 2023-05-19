<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入商品名称" v-model="queryInfo.query" class="input-with-select" clearable @clear="getGoodsList" @keyup.enter.native="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <el-table :data="goodsList" border stripe>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="120px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="90px"></el-table-column>
        <el-table-column label="商品创建时间" prop="add_time" width="160px"></el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="goEditPage(scope.row.goods_id)"></el-button>
            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeGoodsById(scope.row.goods_id)"></el-button>
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
  </div>
</template>

<script>

export default { 
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      goodsList: [],
      total: 0,
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get(`goods`, {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }

      for(let item of res.data.goods) {
        item.add_time = this.$utils.formatToTime(item.add_time)
      }

      this.goodsList = res.data.goods
      this.total = res.data.total
      // console.log(res)
    },
    goAddPage() {
      this.$router.push('/goods/add')
    },
    goEditPage(id) {
      this.$router.push('/goods/edit?id=' + id )
    },
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getGoodsList()
    },
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getGoodsList()
    },
    removeGoodsById(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        })
        .then(async () => {
          const { data: res } = await this.$http.delete(`goods/${id}`)
          if(res.meta.status !== 200) {
            return this.$message.error('删除失败')
          }
          this.getGoodsList()
          this.$message.success('删除成功')
        })
        .catch(() => {
          this.$message.info('已取消删除')
      })
    }
  },
}
</script>

<style lang="scss">
</style>