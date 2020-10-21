<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加用户 -->
      <el-row>
        <el-col>
          <el-button type="primary"  @click="addDialogRoles = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="props">
            <!-- 动态绑定 class 样式 -->
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in props.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removeRightById(props.row, item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag @close="removeRightById(props.row, item2.id)" type="success" closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag @close="removeRightById(props.row, item3.id)" type="warning" v-for="item3 in item2.children" :key="item3.id" closable>{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button @click="showEditDialog(scope.row.id)" size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button @click="removeDialog(scope.row.id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <!-- 分配角色按钮 -->
            <el-button @click="showRightsDialog(scope.row)" size="mini" type="warning" icon="el-icon-setting">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色功能 -->
    <el-dialog title="添加角色" :visible.sync="addDialogRoles" @close="addCloseClear">
      <el-form :model="addForm" :rules="addRules" ref="addRef">
        <el-form-item label="角色名称：" prop="roleName" label-width="100px">
          <el-input v-model="addForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述：" prop="roleDesc" label-width="100px">
          <el-input v-model="addForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogRoles = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogRoles" @close="editCloseClear">
      <el-form :model="editForm" :rules="editRules" ref="editRef" hide-required-asterisk>
        <el-form-item label="角色ID：" label-width="100px">
          <el-input v-model="editForm.roleId" disabled autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色名称：" prop="roleName" label-width="100px">
          <el-input v-model="editForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述：" prop="roleDesc" label-width="100px">
          <el-input v-model="editForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogRoles = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @closed="setRightDialogClear">
      <!-- 树形控件 -->
      <el-tree :data="rightslist" :props="defaultProps" node-key="id" show-checkbox default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取角色列表数据
      rolesList: [],
      // 添加用户弹框
      addDialogRoles: false,
      // 表单数据绑定
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加表单的验证规则对象
      addRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ]
      },
      // 修改用户弹框
      editDialogRoles: false,
      // 查询到的用户信息对象
      editForm: {}, // 数据从后台返回
      // 修改表单的验证规则对象
      editRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' }
        ]
      },
      // 分配权限弹框
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点Id值数组
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }

      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 对话框的关闭事件
    addCloseClear() {
      // 关闭表单页面，重置添加用户表单
      this.$refs.addRef.resetFields() // 为所有的item 添加 prop， 否则无法重置表单
    },
    // 添加
    addUser() {
      // 先验证提交数据的合法性
      this.$refs.addRef.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post('roles', this.addForm)
          if (res.meta.status !== 201) return this.$message.error('添加角色失败！')
          this.$message.success('添加角色成功')
          this.addDialogRoles = false
          this.getRolesList()
        } else {
          return false
        }
      })
    },
    // 展示
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return this.$message.error('查询用户信息失败！')
      this.editForm = res.data
      this.editDialogRoles = true
    },
    // 对话框的关闭事件
    editCloseClear() {
      this.$refs.editRef.resetFields()
    },
    // 修改
    editUser() {
      // 先验证提交数据的合法性
      this.$refs.editRef.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'roles/' + this.editForm.roleId,
            {
              roleName: this.editForm.roleName,
              roleDesc: this.editForm.roleDesc
            }
          )

          if (res.meta.status !== 200) return this.$message.error('更新用户信息失败！')
          // 提示修改成功
          this.$message.success('更新用户信息成功！')
          // 关闭对话框
          this.editDialogRoles = false
          // 刷新数据列表
          this.getRolesList()
        } else {
          return false
        }
      })
    },
    // 删除
    async removeDialog(id) {
      const confirmResult = await this.$confirm(
        '此操作将删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message({ type: 'success', message: '删除成功!' })
      this.getRolesList()
    },
    // 点击删除角色权限功能
    async removeRightById(roled, rightd) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
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

      const { data: res } = await this.$http.delete(
        `roles/${roled.id}/rights/${rightd}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }

      this.$message.success('权限删除成功！')
      // this.getRolesList()
      // 局部刷新
      roled.children = res.data
    },
    // 展示分配权限的对话框
    async showRightsDialog(data1) {
      // 获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败！')
      }
      // 把获取到的权限数据保存到 data 中
      this.rightslist = res.data
      // 当前分配权限的角色id
      this.roleId = data1.id

      // 递归获取三级节点的Id
      this.getLeafKeys(data1, this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含 children 属性，则是三级节点 导出数组并退出
      if (!node.children) {
        return arr.push(node.id)
      }
      // 如果不包含 children 属性，则遍历 其内部的 子元素 children，循环上一次的操作
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 对话框的关闭事件
    setRightDialogClear() {
      // 清空当前数组中的数据
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }

      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
