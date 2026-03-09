<template>
  <div class="project-settlement-page">
    <!-- 返回按钮 -->
    <div class="back-nav">
      <el-button link type="primary" icon="ArrowLeft" @click="handleBack">
        返回项目详情
      </el-button>
    </div>

    <div class="settlement-container">
      <div class="settlement-card">
        <div class="card-header">
          <h1 class="page-title">项目结算</h1>
          <p class="page-subtitle">填写结算金额，上传凭证文件</p>
        </div>

        <!-- 项目信息概览 -->
        <div class="project-overview">
          <h3 class="overview-title">项目信息</h3>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="项目编号">{{ project.projectId }}</el-descriptions-item>
            <el-descriptions-item label="项目名称">{{ project.name }}</el-descriptions-item>
            <el-descriptions-item label="开始日期">{{ project.startDate }}</el-descriptions-item>
            <el-descriptions-item label="结束日期">{{ project.endDate }}</el-descriptions-item>
            <el-descriptions-item label="参与人员">{{ employees.length }}人</el-descriptions-item>
            <el-descriptions-item label="使用设备">{{ devices.length }}台</el-descriptions-item>
          </el-descriptions>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
          class="settlement-form"
        >
          <!-- 结算金额 -->
          <div class="form-section">
            <h2 class="section-title">结算信息</h2>
            <el-divider />

            <el-form-item label="结算金额" prop="settlementAmount" required>
              <el-input-number
                v-model="form.settlementAmount"
                :min="0"
                :precision="2"
                :step="100"
                placeholder="请输入结算金额"
                style="width: 100%"
                controls-position="right"
              >
                <template #prefix>
                  <span style="color: #9a9fa5; font-size: 14px;">¥</span>
                </template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="金额说明">
              <el-input
                v-model="form.amountDescription"
                type="textarea"
                :rows="2"
                placeholder="可选：说明金额计算方式"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </div>

          <!-- 凭证文件 -->
          <div class="form-section">
            <h2 class="section-title">凭证文件</h2>
            <el-divider />

            <el-form-item label="上传凭证" required>
              <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :file-list="fileList"
                multiple
                :limit="10"
                drag
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  拖拽文件到此处或 <em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 pdf/jpg/png 格式，单个文件不超过 10MB，最多 10 个文件
                  </div>
                </template>
              </el-upload>
            </el-form-item>

            <el-form-item label="凭证类型">
              <el-select v-model="form.proofTypes" multiple placeholder="选择凭证类型" style="width: 100%">
                <el-option label="发票" value="invoice" />
                <el-option label="合同" value="contract" />
                <el-option label="付款凭证" value="payment" />
                <el-option label="验收报告" value="acceptance" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </div>

          <!-- 费用明细（可选） -->
          <div class="form-section">
            <h2 class="section-title">费用明细（可选）</h2>
            <el-divider />

            <el-table :data="costDetails" border style="width: 100%">
              <el-table-column prop="category" label="费用类别" width="150">
                <template #default="{ row, $index }">
                  <el-select v-model="row.category" placeholder="选择类别" size="small">
                    <el-option label="人工成本" value="labor" />
                    <el-option label="直接投入" value="direct" />
                    <el-option label="折旧费用" value="depreciation" />
                    <el-option label="无形资产摊销" value="intangible" />
                    <el-option label="设计试验费" value="design" />
                    <el-option label="外包费用" value="outsourcing" />
                    <el-option label="知识产权费" value="ip" />
                    <el-option label="其他费用" value="other" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="说明" min-width="180">
                <template #default="{ row }">
                  <el-input v-model="row.description" placeholder="费用说明" size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="金额 (元)" width="150">
                <template #default="{ row, $index }">
                  <el-input-number
                    v-model="row.amount"
                    :min="0"
                    :precision="2"
                    placeholder="0.00"
                    size="small"
                    controls-position="right"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80">
                <template #default="{ $index }">
                  <el-button link type="danger" size="small" @click="handleRemoveDetail($index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-button type="primary" link icon="Plus" @click="handleAddDetail" style="margin-top: 12px">
              添加明细
            </el-button>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <el-button @click="handleBack">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting" size="large">
              提交结算
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 结算说明卡片 -->
      <div class="info-card">
        <h3 class="info-title">💡 结算说明</h3>
        <ul class="info-list">
          <li>结算金额应包含项目所有相关费用</li>
          <li>凭证文件是审计的重要依据，请确保完整上传</li>
          <li>提交后项目状态将变更为"已结算"</li>
          <li>结算完成后不可修改，请仔细核对</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, UploadFilled, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadUserFile } from 'element-plus'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const uploadRef = ref()
const submitting = ref(false)

// 项目信息
const project = ref<any>({
  projectId: '',
  name: '',
  startDate: '',
  endDate: ''
})
const employees = ref<any[]>([])
const devices = ref<any[]>([])

// 表单数据
const form = reactive({
  settlementAmount: null as number | null,
  amountDescription: '',
  proofTypes: [] as string[],
  proofFiles: [] as any[]
})

// 表单验证规则
const rules: FormRules = {
  settlementAmount: [
    { required: true, message: '请输入结算金额', trigger: 'change' }
  ]
}

// 文件列表
const fileList = ref<UploadUserFile[]>([])

// 费用明细
const costDetails = ref<any[]>([
  { category: '', description: '', amount: null }
])

// Mock 数据
const mockProject = {
  id: 1,
  projectId: 'PRJ202601001',
  name: '智能客服系统研发',
  startDate: '2026-01-10',
  endDate: '2026-02-15'
}

const mockEmployees = [
  { id: 1, name: '张伟' },
  { id: 2, name: '李娜' },
  { id: 3, name: '王强' }
]

const mockDevices = [
  { id: 1, name: 'GPU 服务器 A' },
  { id: 2, name: '测试手机 iPhone15' }
]

// 加载数据
const loadProjectInfo = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    project.value = mockProject
    employees.value = mockEmployees
    devices.value = mockDevices
  } catch (error) {
    ElMessage.error('加载项目信息失败')
  }
}

// 文件变化
const handleFileChange = (file: UploadUserFile, files: UploadUserFile[]) => {
  fileList.value = files
  form.proofFiles = files.map(f => ({
    name: f.name,
    size: f.size,
    type: f.name.split('.').pop()
  }))
}

const handleFileRemove = (file: UploadUserFile, files: UploadUserFile[]) => {
  fileList.value = files
  form.proofFiles = files.map(f => ({
    name: f.name,
    size: f.size,
    type: f.name.split('.').pop()
  }))
}

// 添加明细
const handleAddDetail = () => {
  costDetails.value.push({ category: '', description: '', amount: null })
}

const handleRemoveDetail = (index: number) => {
  if (costDetails.value.length === 1) {
    ElMessage.warning('至少保留一行明细')
    return
  }
  costDetails.value.splice(index, 1)
}

// 返回
const handleBack = () => {
  router.push(`/projects/${route.params.id}`)
}

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    if (fileList.value.length === 0) {
      ElMessage.warning('请至少上传一个凭证文件')
      return
    }

    await ElMessageBox.confirm(
      '提交后项目将变更为"已结算"状态，无法再修改。确认要提交结算吗？',
      '确认结算',
      {
        confirmButtonText: '确认提交',
        cancelButtonText: '再想想',
        type: 'warning'
      }
    )

    submitting.value = true
    try {
      // TODO: 调用 API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success('结算提交成功')
      router.push(`/projects/${route.params.id}`)
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error('提交结算失败')
      }
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  loadProjectInfo()
})
</script>

<style scoped lang="scss">
.project-settlement-page {
  padding: 24px;
}

.back-nav {
  margin-bottom: 16px;
}

.settlement-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  max-width: 1200px;
}

.settlement-card {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .card-header {
    margin-bottom: 32px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #272b30;
      margin: 0 0 8px 0;
    }

    .page-subtitle {
      font-size: 14px;
      color: #9a9fa5;
      margin: 0;
    }
  }
}

.project-overview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;

  .overview-title {
    font-size: 14px;
    font-weight: 600;
    color: #6f767e;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.form-section {
  margin-bottom: 32px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #272b30;
    margin: 0 0 16px 0;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f4f4f4;
}

.info-card {
  background: #fff8e6;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  height: fit-content;

  .info-title {
    font-size: 16px;
    font-weight: 600;
    color: #272b30;
    margin: 0 0 16px 0;
  }

  .info-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      font-size: 14px;
      color: #6f767e;
      line-height: 1.8;
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;

      &::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #d48806;
        font-weight: bold;
      }
    }
  }
}

@media (max-width: 900px) {
  .settlement-container {
    grid-template-columns: 1fr;
  }
}
</style>
