<template>
  <div class="profile-view">
    <div class="container">
      <div class="profile-header">
        <h1 class="page-title">个人中心</h1>
        <p class="page-subtitle">管理您的个人信息和账户设置</p>
      </div>

      <el-card class="profile-card" v-loading="loading">
        <template #header>
          <div class="card-header">
            <span class="card-title">基本信息</span>
            <el-button
              v-if="!isEditing"
              type="primary"
              @click="startEdit"
              :icon="Edit"
            >
              编辑资料
            </el-button>
            <div v-else class="edit-actions">
              <el-button @click="cancelEdit">取消</el-button>
              <el-button type="primary" @click="saveProfile" :loading="saving">
                保存
              </el-button>
            </div>
          </div>
        </template>

        <div class="profile-content">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :disabled="!isEditing"
              accept="image/*"
            >
              <el-avatar
                :size="120"
                :src="editForm.avatar || userInfo?.avatar"
                :icon="UserFilled"
                class="avatar-display"
              />
              <div v-if="isEditing" class="avatar-overlay">
                <el-icon :size="24"><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </el-upload>
          </div>

          <!-- 信息表单 -->
          <div class="info-section">
            <el-form
              ref="formRef"
              :model="editForm"
              :rules="formRules"
              label-width="100px"
              label-position="left"
            >
              <el-form-item label="昵称" prop="nickname">
                <el-input
                  v-if="isEditing"
                  v-model="editForm.nickname"
                  placeholder="请输入昵称"
                  clearable
                />
                <span v-else class="info-text">
                  {{ userInfo?.nickname || '未设置' }}
                </span>
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-if="isEditing"
                  v-model="editForm.email"
                  placeholder="请输入邮箱"
                  clearable
                />
                <span v-else class="info-text">
                  {{ userInfo?.email || '未设置' }}
                </span>
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input
                  v-if="isEditing"
                  v-model="editForm.phone"
                  placeholder="请输入手机号"
                  clearable
                />
                <span v-else class="info-text">
                  {{ userInfo?.phone || '未设置' }}
                </span>
              </el-form-item>

              <el-form-item label="性别" prop="gender">
                <el-select
                  v-if="isEditing"
                  v-model="editForm.gender"
                  placeholder="请选择性别"
                  style="width: 100%"
                >
                  <el-option label="保密" :value="0" />
                  <el-option label="男" :value="1" />
                  <el-option label="女" :value="2" />
                </el-select>
                <span v-else class="info-text">
                  {{ getGenderText(userInfo?.gender) }}
                </span>
              </el-form-item>

              <el-form-item label="生日" prop="birthday">
                <el-date-picker
                  v-if="isEditing"
                  v-model="editForm.birthday"
                  type="date"
                  placeholder="请选择生日"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
                <span v-else class="info-text">
                  {{ userInfo?.birthday || '未设置' }}
                </span>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </el-card>

      <!-- 账户安全 -->
      <el-card class="security-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">账户安全</span>
          </div>
        </template>

        <div class="security-content">
          <div class="security-item">
            <div class="security-info">
              <el-icon :size="24" class="security-icon"><Lock /></el-icon>
              <div class="security-text">
                <h3>登录密码</h3>
                <p>定期更换密码可以提高账户安全性</p>
              </div>
            </div>
            <el-button type="text" @click="handleChangePassword">
              修改密码
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Edit, UserFilled, Camera, Lock } from '@element-plus/icons-vue'
import userService, { type UserInfo } from '@/services/user'

// 状态
const loading = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const userInfo = ref<UserInfo | null>(null)
const formRef = ref<FormInstance>()

// 编辑表单
const editForm = reactive<UserInfo>({
  avatar: '',
  nickname: '',
  email: '',
  phone: '',
  gender: 0,
  birthday: '',
})

// 原始数据备份
let originalData: UserInfo = {}

// 表单验证规则
const formRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
}

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    userInfo.value = await userService.getMemberInfo()
    // 复制到编辑表单
    Object.assign(editForm, userInfo.value)
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    ElMessage.error(error.message || '获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
  // 备份原始数据
  originalData = { ...editForm }
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  // 恢复原始数据
  Object.assign(editForm, originalData)
  // 清除验证
  formRef.value?.clearValidate()
}

// 保存资料
const saveProfile = async () => {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    saving.value = true

    // 准备更新数据
    const updateData: Partial<UserInfo> = {
      nickname: editForm.nickname,
      email: editForm.email,
      phone: editForm.phone,
      gender: editForm.gender,
      birthday: editForm.birthday,
      avatar: editForm.avatar,
    }

    // 调用更新接口
    await userService.updateMemberInfo(updateData)

    // 更新用户信息
    userInfo.value = { ...editForm }
    isEditing.value = false

    ElMessage.success('保存成功')
  } catch (error: any) {
    console.error('保存用户信息失败:', error)
    if (error.message) {
      ElMessage.error(error.message)
    }
  } finally {
    saving.value = false
  }
}

// 头像上传前的处理
const beforeAvatarUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    editForm.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // 阻止自动上传，因为我们是手动保存
  return false
}

// 获取性别文本
const getGenderText = (gender?: number) => {
  switch (gender) {
    case 1:
      return '男'
    case 2:
      return '女'
    default:
      return '保密'
  }
}

// 修改密码
const handleChangePassword = () => {
  ElMessage.info('修改密码功能开发中')
}

// 组件挂载
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-view {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
  padding: 40px 0;
  position: relative;
}

.profile-view::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  z-index: 0;
}

.container {
  position: relative;
  z-index: 1;
}

.profile-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.page-subtitle {
  font-size: 16px;
  color: #606266;
}

.profile-card,
.security-card {
  max-width: 800px;
  margin: 0 auto 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.edit-actions {
  display: flex;
  gap: 12px;
}

.profile-content {
  display: flex;
  gap: 40px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-uploader {
  position: relative;
  cursor: pointer;
}

.avatar-display {
  border: 3px solid #f0f0f0;
  transition: all 0.3s;
}

.avatar-uploader:hover .avatar-display {
  border-color: #409eff;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.3s;
}

.avatar-uploader:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay span {
  font-size: 12px;
  margin-top: 4px;
}

.info-section {
  flex: 1;
}

.info-text {
  color: #606266;
  font-size: 14px;
}

.security-content {
  padding: 12px 0;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.security-item:hover {
  background-color: #f5f7fa;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.security-icon {
  color: #409eff;
}

.security-text h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 4px;
}

.security-text p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .profile-view {
    padding: 20px 0;
  }

  .page-title {
    font-size: 28px;
  }

  .profile-content {
    flex-direction: column;
    align-items: center;
    gap: 24px;
  }

  .info-section {
    width: 100%;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .edit-actions {
    width: 100%;
  }

  .edit-actions .el-button {
    flex: 1;
  }

  :deep(.el-form-item__label) {
    text-align: left;
  }
}
</style>

