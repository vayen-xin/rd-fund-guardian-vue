<template>
  <div class="project-settlement-page">
    <!-- 返回按钮 -->
    <div class="back-nav">
      <button class="btn btn-link" @click="handleBack">
        <span class="btn-icon">←</span>
        返回项目详情
      </button>
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
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">项目编号</span>
              <span class="info-value">{{ project.projectId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">项目名称</span>
              <span class="info-value">{{ project.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">开始日期</span>
              <span class="info-value">{{ project.startDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">结束日期</span>
              <span class="info-value">{{ project.endDate }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">参与人员</span>
              <span class="info-value">{{ employees.length }}人</span>
            </div>
            <div class="info-item">
              <span class="info-label">使用设备</span>
              <span class="info-value">{{ devices.length }}台</span>
            </div>
          </div>
        </div>

        <form class="form" @submit.prevent="handleSubmit">
          <!-- 结算金额 -->
          <div class="form-section">
            <h2 class="section-title">结算信息</h2>
            <div class="section-divider"></div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                结算金额 (元)
              </label>
              <div class="input-with-prefix">
                <span class="input-prefix">¥</span>
                <input 
                  type="number" 
                  class="form-input" 
                  v-model="form.settlementAmount"
                  placeholder="请输入结算金额"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">金额说明</label>
              <textarea 
                class="form-textarea" 
                v-model="form.amountDescription"
                placeholder="可选：说明金额计算方式"
                maxlength="500"
                rows="2"
              ></textarea>
              <span class="input-count">{{ form.amountDescription.length }}/500</span>
            </div>
          </div>

          <!-- 凭证文件 -->
          <div class="form-section">
            <h2 class="section-title">凭证文件</h2>
            <div class="section-divider"></div>

            <div class="form-group">
              <label class="form-label">
                <span class="required">*</span>
                上传凭证
              </label>
              <div class="upload-area" @click="triggerFileInput">
                <input 
                  type="file" 
                  ref="fileInput"
                  @change="handleFileChange"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  style="display: none"
                />
                <div class="upload-icon">📁</div>
                <div class="upload-text">拖拽文件到此处或 <span class="upload-link">点击上传</span></div>
                <div class="upload-tip">支持 pdf/jpg/png 格式，单个文件不超过 10MB，最多 10 个文件</div>
              </div>

              <div v-if="fileList.length > 0" class="file-list">
                <div v-for="(file, index) in fileList" :key="index" class="file-item">
                  <span class="file-icon">📄</span>
                  <span class="file-name">{{ file.name }}</span>
                  <button type="button" class="file-remove" @click="handleFileRemove(index)">×</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">凭证类型</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" value="invoice" v-model="form.proofTypes" />
                  <span class="checkbox-text">发票</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="contract" v-model="form.proofTypes" />
                  <span class="checkbox-text">合同</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="payment" v-model="form.proofTypes" />
                  <span class="checkbox-text">付款凭证</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="acceptance" v-model="form.proofTypes" />
                  <span class="checkbox-text">验收报告</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="other" v-model="form.proofTypes" />
                  <span class="checkbox-text">其他</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 费用明细 -->
          <div class="form-section">
            <div class="section-header">
              <h2 class="section-title">费用明细（可选）</h2>
              <button type="button" class="btn btn-link" @click="handleAddDetail">
                <span class="btn-icon">+</span>
                添加明细
              </button>
            </div>
            <div class="section-divider"></div>

            <table class="detail-table">
              <thead>
                <tr>
                  <th width="150">费用类别</th>
                  <th>说明</th>
                  <th width="150">金额 (元)</th>
                  <th width="80">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in costDetails" :key="index">
                  <td>
                    <select class="form-select" v-model="row.category">
                      <option value="">选择类别</option>
                      <option value="labor">人工成本</option>
                      <option value="direct">直接投入</option>
                      <option value="depreciation">折旧费用</option>
                      <option value="intangible">无形资产摊销</option>
                      <option value="design">设计试验费</option>
                      <option value="outsourcing">外包费用</option>
                      <option value="ip">知识产权费</option>
                      <option value="other">其他费用</option>
                    </select>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      class="form-input" 
                      v-model="row.description"
                      placeholder="费用说明"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      class="form-input" 
                      v-model="row.amount"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <button type="button" class="btn-link btn-delete" @click="handleRemoveDetail(index)">
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="handleBack">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? '提交中...' : '提交结算' }}
            </button>
          </div>
        </form>
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

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const fileInput = ref()
const submitting = ref(false)

// 项目信息
const project = ref({ projectId: '', name: '', startDate: '', endDate: '' })
const employees = ref([])
const devices = ref([])

// 表单数据
const form = reactive({
  settlementAmount: null,
  amountDescription: '',
  proofTypes: [],
  proofFiles: []
})

// 文件列表
const fileList = ref([])

// 费用明细
const costDetails = ref([{ category: '', description: '', amount: null }])

// Mock 数据
const mockProject = { id: 1, projectId: 'PRJ202601001', name: '智能客服系统研发', startDate: '2026-01-10', endDate: '2026-02-15' }
const mockEmployees = [{ id: 1, name: '张伟' }, { id: 2, name: '李娜' }, { id: 3, name: '王强' }]
const mockDevices = [{ id: 1, name: 'GPU 服务器 A' }, { id: 2, name: '测试手机 iPhone15' }]

// 加载数据
const loadProjectInfo = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    project.value = mockProject
    employees.value = mockEmployees
    devices.value = mockDevices
  } catch (error) {
    alert('加载项目信息失败')
  }
}

// 触发文件选择
const triggerFileInput = () => fileInput.value.click()

// 文件变化
const handleFileChange = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    if (fileList.value.length < 10) {
      fileList.value.push({ name: file.name, size: file.size, type: file.name.split('.').pop() })
    }
  })
  form.proofFiles = fileList.value
}

const handleFileRemove = (index) => {
  fileList.value.splice(index, 1)
  form.proofFiles = fileList.value
}

// 添加明细
const handleAddDetail = () => costDetails.value.push({ category: '', description: '', amount: null })

const handleRemoveDetail = (index) => {
  if (costDetails.value.length === 1) {
    alert('至少保留一行明细')
    return
  }
  costDetails.value.splice(index, 1)
}

// 返回
const handleBack = () => router.push(`/projects/${route.params.id}`)

// 提交
const handleSubmit = async () => {
  if (!form.settlementAmount) {
    alert('请输入结算金额')
    return
  }
  if (fileList.value.length === 0) {
    alert('请至少上传一个凭证文件')
    return
  }

  if (!confirm('提交后项目将变更为"已结算"状态，无法再修改。确认要提交结算吗？')) {
    return
  }

  submitting.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('结算提交成功')
    router.push(`/projects/${route.params.id}`)
  } catch (error) {
    alert('提交结算失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => loadProjectInfo())
</script>

<style scoped lang="scss">
.project-settlement-page {
  padding: 40px;
  min-height: calc(100vh - 80px);
  background: #f4f4f4;
}

.back-nav { margin-bottom: 24px; }

.settlement-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  max-width: 1200px;
}

.settlement-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .card-header {
    margin-bottom: 32px;
    .page-title { font-size: 28px; font-weight: 600; color: #272b30; margin: 0 0 8px 0; }
    .page-subtitle { font-size: 14px; color: #9a9fa5; margin: 0; }
  }
}

.project-overview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;

  .overview-title { font-size: 14px; font-weight: 600; color: #6f767e; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .info-item {
      .info-label { display: block; font-size: 12px; color: #9a9fa5; margin-bottom: 4px; }
      .info-value { font-size: 14px; color: #272b30; }
    }
  }
}

.form-section {
  margin-bottom: 32px;

  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }

  .section-title { font-size: 16px; font-weight: 600; color: #272b30; margin: 0; }

  .section-divider { height: 1px; background: #f0f0f0; margin-bottom: 24px; }
}

.form-group {
  margin-bottom: 24px;
  position: relative;

  .form-label {
    display: block;
    font-size: 14px;
    color: #272b30;
    margin-bottom: 8px;
    font-weight: 500;
    .required { color: #ff4d4f; margin-right: 2px; }
  }

  .form-input, .form-select, .form-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    font-size: 14px;
    color: #272b30;
    background: white;
    transition: all 0.2s;
    &:focus { outline: none; border-color: #252833; box-shadow: 0 0 0 2px rgba(37, 40, 51, 0.1); }
    &::placeholder { color: #9a9fa5; }
  }

  .form-textarea { resize: vertical; min-height: 60px; }

  .input-count { position: absolute; right: 10px; bottom: -20px; font-size: 12px; color: #9a9fa5; }
}

.input-with-prefix {
  display: flex;
  align-items: center;
  .input-prefix { padding: 10px 14px; background: #f4f4f4; border: 1px solid #e8e8e8; border-right: none; border-radius: 8px 0 0 8px; color: #9a9fa5; }
  .form-input { border-radius: 0 8px 8px 0; }
}

.upload-area {
  border: 2px dashed #e8e8e8;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: #252833; background: #fafafa; }

  .upload-icon { font-size: 40px; margin-bottom: 12px; }
  .upload-text { font-size: 14px; color: #272b30; margin-bottom: 8px; .upload-link { color: #1890ff; } }
  .upload-tip { font-size: 12px; color: #9a9fa5; }
}

.file-list {
  margin-top: 16px;
  .file-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f4f4f4;
    border-radius: 6px;
    margin-bottom: 8px;
    .file-icon { font-size: 16px; }
    .file-name { flex: 1; font-size: 14px; color: #272b30; }
    .file-remove { background: none; border: none; color: #ff4d4f; cursor: pointer; font-size: 18px; padding: 0; &:hover { color: #ff7875; } }
  }
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; }
    .checkbox-text { font-size: 14px; color: #272b30; }
  }
}

.detail-table {
  width: 100%;
  border-collapse: collapse;

  th { text-align: left; padding: 12px; font-size: 13px; font-weight: 600; color: #595959; border-bottom: 1px solid #f0f0f0; background: #fafafa; }
  td { padding: 12px; border-bottom: 1px solid #f0f0f0; }
  tr:hover td { background: #f5f5f5; }
  .form-input, .form-select { padding: 6px 10px; font-size: 13px; }
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

  .info-title { font-size: 16px; font-weight: 600; color: #272b30; margin: 0 0 16px 0; }

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
      &::before { content: '•'; position: absolute; left: 0; color: #d48806; font-weight: bold; }
    }
  }
}

// 按钮
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  .btn-icon { font-size: 16px; font-weight: bold; }

  &.btn-primary { background: #252833; color: white; &:hover { background: #3d4152; } &:disabled { opacity: 0.6; cursor: not-allowed; } }
  &.btn-outline { background: white; color: #272b30; border: 1px solid #d9d9d9; &:hover { border-color: #252833; color: #252833; } }
  &.btn-link { background: none; border: none; color: #1890ff; padding: 4px 8px; cursor: pointer; font-size: 14px; &:hover { color: #40a9ff; } }
  &.btn-delete { color: #ff4d4f; &:hover { background: #fff1f0; } }
}

@media (max-width: 900px) {
  .settlement-container { grid-template-columns: 1fr; }
  .project-overview .info-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>