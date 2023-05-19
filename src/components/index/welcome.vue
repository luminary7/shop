<template>
  <div class="welcome">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>欢迎页</el-breadcrumb-item>
    </el-breadcrumb>

    <el-row :gutter="10">
      <el-col :span="6">
        <div class="stat">
          <div class="title">
            <p>用户统计</p>
            <el-tag size="mini" type="success">实时</el-tag>
          </div>
          <div class="num">{{ totalUsers }}</div>
          <div class="tip">当前用户数量</div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="stat" style="background: #e6a23c">
          <div class="title">
            <p>商品统计</p>
            <el-tag size="mini" type="success">实时</el-tag>
          </div>
          <div class="num">{{ totalGoods }}</div>
          <div class="tip">当前商品数量</div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="stat" style="background: #67c23a">
          <div class="title">
            <p>订单统计</p>
            <el-tag size="mini" type="success">实时</el-tag>
          </div>
          <div class="num">{{ totalOrders }}</div>
          <div class="tip">当前订单数量</div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="stat" style="background: #909399">
          <div class="title">
            <p>销售统计</p>
            <el-tag size="mini" type="success">实时</el-tag>
          </div>
          <div class="num">7</div>
          <div class="tip">当前销售总额(元)</div>
        </div>
      </el-col>
    </el-row>

    <div class="echarts-container">
      <el-card id="chart1"></el-card>
      <el-card id="chart2"></el-card>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data() {
    return {
      totalUsers: 0,
      totalGoods: 0,
      totalOrders: 0,
      totalSales: 0,
      orderList: [],
    }
  },
  created() {
    this.getUserList()
    this.getGoodsList()
    this.getOrderList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: {
          pagenum: 1,
          pagesize: 1,
        },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户数据失败')
      }
      this.totalUsers = res.data.total
    },
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: {
          pagenum: 1,
          pagesize: 1,
        },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败')
      }
      this.totalGoods = res.data.total
    },
    async getOrderList() {
      const { data: res } = await this.$http.get('orders')
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据失败')
      }
      this.totalOrders = res.data.total

      // 计算总销售额
      this.orderList = res.data.goods
      this.orderList.forEach((item) => {
        if (item.pay_status === '1') {
          this.totalSales += item.order_price
        }
      })

      // 展示图表
      this.initChart1()
      this.initChart2()
    },
    initChart1() {
      var chart = echarts.init(document.getElementById('chart1'))
      var option = {
        title: {
          text: '订单趋势',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
          },
        },
        xAxis: {
          type: 'category',
          data: [], // ['03.20', '03.21'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'line',
            smooth: true,
            data: [], // [260, 406]
          },
        ],
      }
      this.orderList.sort(function (a, b) {
        return a.created_time - b.created_time
      })
      let data = []
      this.orderList.forEach((order) => {
        if (order.pay_status === '1') {
          let key = this.$utils.formatToDate(order.create_time)
          if (!data[key]) {
            data[key] = order.order_price
          } else {
            data[key] += order.order_price
          }
        }
      })
      for (var key in data) {
        console.log(key)
        option.xAxis.data.push(key)
        option.series[0].data.push(data[key])
      }
      chart.setOption(option)
    },
    initChart2() {
      var chart = echarts.init(document.getElementById('chart2'))
      // 订单状态
      var option = {
        title: {
          text: '订单状态',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'right',
          data: [],
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }

      var data = [
        {
          name: '已付款',
          value: 0,
        },
        {
          name: '未付款',
          value: 0,
        },
      ]

      this.orderList.forEach((order) => {
        if (order.pay_status === '1') {
          data[0].value++
        } else {
          data[1].value++
        }
      })

      for (var order of data) {
        option.legend.data.push(order.name)
        option.series[0].data.push(order)
      }

      chart.setOption(option)
    },
  },
}
</script>

<style lang="scss">
.el-row {
  padding: 0 8px;
  .stat {
    background: #409eff;
    color: aliceblue;
    height: 100px;
    border-radius: 8px;
    padding: 0 8px;

    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 30px;
      p {
        font-weight: bold;
      }
    }
    .num {
      font-size: 20px;
      font-weight: bold;
      height: 40px;
      line-height: 40px;
    }

    .tip {
      height: 30px;
      line-height: 30px;
    }
  }
}
.echarts-container {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;

  .el-card {
    height: 400px;
    width: 50%;
  }
}
</style>