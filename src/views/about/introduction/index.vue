
<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>鑫智策定价系统</h2>
        <p>
          鑫智策定价系统是一款专业的定价决策系统，为金融机构提供智能化的信贷产品定价解决方案。系统集成了先进的算法模型，支持多维度数据分析和实时决策，助力金融机构提升定价效率和风险管理能力。
        </p>
        <p>
          <b>当前版本:</b> <span>v3.1.0</span>
        </p>
        <p>
          <el-tag type="danger">&yen;免费开源</el-tag>
        </p>
        <p>
         <el-button
            type="primary"
            icon="Cloudy"
            plain
            @click="goTarget('https://gitee.com/iceyWu/xzc_front')"
            >后管（前端）码云</el-button
          >
          <el-button
            type="primary"
            icon="Cloudy"
            plain
            @click="goTarget('https://gitee.com/iceyWu/xzc_server')"
            >后管（后端）码云</el-button
          >
          <el-button
            type="primary"
            icon="Cloudy"
            plain
            @click="goTarget('https://gitee.com/duanyw881028/xzc.git')"
            >模型服务码云</el-button
          >
        </p>
      </el-col>
       
      <el-col :sm="24" :lg="12" style="padding-left: 50px">
        <el-row>
          <el-col :span="12">
            <h2>技术选型</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <h4>后端技术</h4>
            <ul>
              <li>SpringBoot</li>
              <li>Spring Security</li>
              <li>JWT</li>
              <li>MyBatis</li>
              <li>Druid</li>
              <li>Redis</li>
              <li>...</li>
            </ul>
          </el-col>
          <el-col :span="6">
            <h4>前端技术</h4>
            <ul>
              <li>Vue</li>
              <li>Vuex</li>
              <li>Element-ui</li>
              <li>Axios</li>
              <li>Sass</li>
              <li>Quill</li>
              <li>...</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>关于我们</span>
            </div>
          </template>
          <div class="body">
            <p>
              <i class="el-icon-s-promotion"></i> 作品演示：<el-link
                href="http://47.101.153.130/play.html"
                target="_blank"
                >http://47.101.153.130/play.html/</el-link
              >
            </p>
            <p>
              <i class="el-icon-money"></i> 系统名称：<a
                href="javascript:;"
                class="qq号"
                >鑫智策定价系统</a>
            </p>
            <p>
              <i class="el-icon-chat-dot-round"></i> 系统作者：段元文（开发）
            </p>
            <p style="padding-left:60px;">吴银双（开发）</p>
            <p style="padding-left:60px;">尹彬（业务）</p>
            <p>
              <i class="el-icon-money"></i> 团队理念：<a
                href="javascript:;"
                class="qq号"
                >简单和谐 尊重信任</a>
            </p>
            <p>
              <i class="el-icon-money"></i> 联系方式：<a
                href="javascript:;"
                class="qq号"
                >18120156021</a>
            </p>
            <p>
              <i class="el-icon-money"></i> 官方邮箱：<a
                href="javascript:;"
                class="qq号"
                >wys199811@163.com</a>
            </p>
            <p>
              <i class="el-icon-money"></i> 版权声明：<a
                href="javascript:;"
                class="qq号"
                >AI大赛吴银双团队 保留所有权利</a>
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>更新日志</span>
            </div>
          </template>
          <el-collapse accordion>
            <el-collapse-item title="v3.1.0 - 2026-07-23">
              <ol>
                <li>接入后端AI对话接口</li>
                <li>接入后端生成报告信息展示</li>
                <li>新增定价模型参数配置菜单功能</li>
                <li>新增定价信息查询菜单功能</li>
                <li>其他细节优化</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="v3.0.0 - 2026-07-11">
              <ol>
                <li>新增lighntGBN基础利率定价模型</li>
                <li>新增ε-greedy策略探索利润空间</li>
                <li>系统自动生成决策报告</li>
                <li>新增合规校验业务参数</li>
                <li>其他细节优化</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="v2.1.1 - 2026-07-02">
              <ol>
                <li>更新17个客户特征</li>
                <li>利率浮动增加向下区间</li>
                <li>转化率按敏感度分群和线性衰减</li>
                <li>其他细节优化</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="v2.1.0 - 2026-06-15">
              <ol>
                <li>新增AI对话菜单功能</li>
                <li>修改高级管理员个人信息</li>
                <li>其他细节优化</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="v2.0.0 - 2026-06-11">
              <ol>
                <li>更新公司logo图片</li>
                <li>更新系统相关信息首页展示</li>
                <li>其他细节优化</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="v1.0.0 - 2026-06-08">
              <ol>
                <li>鑫智策定价系统正式发布</li>
              </ol>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <template v-slot:header>
            <div class="clearfix">
              <span>问题反馈</span>
            </div>
          </template>
          <div class="body">
            <img
              src="@/assets/images/pay.jpg"
              alt="donate"
              style="width:100%"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="About">
import { ref } from 'vue'

const version = ref('3.9.2')

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 700;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>