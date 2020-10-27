<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card shadow="always">
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <!-- :expand-type="false"->隐藏展开行  show-index->显示索引 selection-type->隐藏多选框-->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" :show-row-hover="false" show-index index-text="#" border>
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0" type= '' size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level===1" type="success" size="mini">二级</el-tag>
          <el-tag v-else type="danger" size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button @click="showEditCateDialog(scope.row.cat_id)" type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <!-- 删除按钮 -->
          <el-button @click="removeCateDialog(scope.row.cat_id)" type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <!-- :current-page="queryInfo.pagenum"->当前显示多少条数据  :page-size="queryInfo.pagesize"->当前的页数 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
    </el-card>

    <!-- 添加分类 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <!-- change-on-select 允许选择任意级 -->
          <!-- @change="parentCateChanged" 数据发生改变时触发 -->
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChanged" clearable></el-cascader>
          </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogRoles" @close="editCateDialogClose">
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" hide-required-asterisk>
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogRoles = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        // 当前页码数
        pagenum: 1,
        // 每页显示多少条数据
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          width: '200px',
          template: 'opt'
        }
      ],
      // 添加分类弹出框
      addCateDialogVisible: false,
      // 添加分类表单数据
      addCateForm: {
        // 分类父 ID
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类层级
        cat_level: 0
      },
      // 表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 修改分类弹出框
      editCateDialogRoles: false,
      // 修改分类表单数据
      editCateForm: {}, // 数据从后台返回
      // 修改分类的验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      // console.log(res.data)
      this.catelist = res.data.result
      // 为总数据条数赋值
      this.total = res.data.total
    },
    // 监听 pagesize 改变 每页的数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 刷新页面
      this.getCateList()
    },
    // 监听 pagenum 改变 第几页
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      // 清空父级分类
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 点击展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 选择项发生变化时
    parentCateChanged() {
      // console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id  父级选项的id值为数组selectedKeys的最后一个值
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击添加新的分类
    addCate() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 展示
    async showEditCateDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类信息失败！')
      }
      this.editCateForm = res.data
      this.editCateDialogRoles = true
      // console.log(this.editCateForm)
    },
    // 对话框的关闭事件
    editCateDialogClose() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 修改
    editCate() {
    //   // 先验证提交数据的合法性
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'categories/' + this.editCateForm.cat_id,
            {
              cat_name: this.editCateForm.cat_name
            }
          )

          if (res.meta.status !== 200) return this.$message.error('更新分类信息失败！')
          // 提示修改成功
          this.$message.success('更新分类信息成功！')
          // 关闭对话框
          this.editCateDialogRoles = false
          this.getCateList()
          // 局部刷新未实现
          // this.editCateForm.children = res.data
        } else {
          return false
        }
      })
    },
    // 删除
    async removeCateDialog(id) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => error)

      if (confirmResult !== 'confirm') {
        return this.$message(
          {
            type: 'info',
            message: '已取消删除'
          }
        )
      }

      const { data: res } = await this.$http.delete('categories/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }

      this.$message.success('权限删除成功！')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
