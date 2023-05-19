<template>
  <div class="home">
    <el-container>
      <!-- 头部 -->
      <el-header>
        <div class="left">
          <img src="../assets/imgs/shop.png" alt="" />
          <span>电商管理系统</span>
        </div>

        <div class="right">
          <span>欢迎您：{{ userInfo.username }}</span>
          <el-button type="danger" size="mini" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="isCollapse = !isCollapse">|||</div>
          <el-menu :default-active="$route.path" unique-opened router :collapse="isCollapse" :collapse-transition="false">
            <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
              <template slot="title">
                <i :class="iconObj[item.id]" style="margin-right:10px"></i>
                <span>{{ item.authName }}</span>
              </template>
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
                <i class="el-icon-menu"></i>
                {{ subItem.authName }}
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>

        <!-- 主体内容 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userInfo: null,
      menuList: [],
      isCollapse: false,
      iconObj: {
        201: "iconfont icon-shouye",
        125: "iconfont icon-users",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
      },
    }
  },
  created() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
    this.getMenuList()
    this.$message.success('已成功刷新页面')
  },
  methods: {
    // 退出登录
    logout() {
      this.$confirm('是否退出登录?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '退出成功!',
          })
          sessionStorage.clear()
          this.$router.push('/login')
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消退出',
          })
        })
    },
    // 获取菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
      //   console.log(this.menuList);
    },
  },
}
</script>

<style lang="scss">
.home {
  height: 100%;
}

.el-container {
  height: 100%;
}

.el-header {
  background: #93defd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;

  .left {
    display: flex;
    align-items: center;
    img {
      width: 40px;
      margin-right: 20px;
    }
    span {
      font-size: 20px;
    }
  }

  .right {
    span {
      margin-right: 10px;
    }
  }
}

.el-aside {
  height: 100%;

  .toggle-button {
    background: #60779d;
    line-height: 24px;
    font-size: 16px;
    color: #fff;
    letter-spacing: 0.2rem;
    cursor: pointer;
  }

  .el-menu {
    text-align: left;
    height: auto;
    border-right: 0;
  }
}
.el-main {
  background: #eaedf1;
}
</style>