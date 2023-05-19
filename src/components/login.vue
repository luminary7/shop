<template>
  <div class="login-container">
    <div class="login-left">
      <img src="../assets/imgs/login_img.png" alt="" />
    </div>

    <div class="login-box">
      <!--头像-->
      <div class="avatar-box">
        <img src="../assets/imgs/login_logo.png" alt="" />
      </div>
      <div class="title">电商管理系统</div>

      <el-form ref="loginFormRef" :model="loginForm" class="login-form" :rules="loginFromRules">
        <el-form-item prop="username">
          <el-input placeholder="请输入用户名" prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input placeholder="请输入密码" show-password prefix-icon="el-icon-lock" v-model="loginForm.password"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="login-btn" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
      },

      loginFromRules: {
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
            message: '长度在 3 到 10 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    login() {
      // 表单是否校验成功
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        // 解构返回数据 获取其中的data数据 并且重命名为res
        const { data: res } = await this.$http.post('login', this.loginForm)
        console.log(res)

        if (res.meta.status != 200) {
          return this.$message.error('登录失败，用户不存在')
        }
        this.$message.success('登录成功')
        // 用户信息保存到sessionStorage中
        sessionStorage.setItem('userInfo', JSON.stringify(res.data))
        this.$router.push('/home')
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.login-container {
  background: #93defd;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-left {
    margin-right: 100px;
  }

  .login-box {
    width: 400px;
    height: 350px;
    background: #fff;
    padding: 50px;
    border-radius: 6px;
    box-sizing: border-box;
    position: relative;

    .avatar-box {
      width: 120px;
      height: 120px;
      border: 5px solid #93defd;
      border-radius: 100px;
      text-align: center;
      line-height: 110px;
      position: absolute;
      top: -60px;
      right: 140px;
      background-color: #fff;
    }

    .title {
      position: absolute;
      top: 100px;
      left: 50%;
      transform: translate(-50%);
      font-size: 18px;
      color: #444;
    }

    .login-form {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%);
      padding: 20px;
      width: 80%;
      box-sizing: border-box;

      .login-btn {
        width: 100%;
      }
    }
  }
}
</style>