<template>
  <div class="attendance-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">打卡记录导入</h1>
        <span class="page-subtitle">导入员工打卡记录，支持 Excel/CSV 格式</span>
      </div>
      <div class="header-right">
        <el-button type="primary" icon="Download" @click="handleDownloadTemplate">
          下载模板
        </el-button>
        <el-button type="success" icon="Upload" @click="handleUpload">
          导入记录
        </el-button>
      </div>
    </div>

    <!-- 导入区域 -->
    <div class="upload-card">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
        :limit="1"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或 <em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持 xlsx/csv 格式，单个文件不超过 10MB
          </div>
        </template>
      </el-upload>
      <div class="upload-actions">
        <el-button type="primary" @click="handleConfirmUpload" :disabled="!fileList.length">
          开始导入
        </el-button>
      </div>
    </div>

    <!-- 导入历史 -->
    <div class="table-card">
      <h3 class="card-title">导入历史</h3>
      <el-table :data="importHistory" v-loading="loading" style="width: 100%">
        <el-table-column prop="batchNo" label="批次号" width="180" />
        <el-table-column prop="fileName" label="文件名" min-width="200" />
        <el-table-column prop="recordCount" label="记录数" width="100" />
        <el-table-column prop="successCount" label="成功数" width="100" />
        <el-table-column prop="failCount" label="失败数" width="100" />
        <el-table-column prop="importedBy" label="导入人" width="100" />
        <el-table-column prop="importedAt" label="导入时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'warning'">
              {{ row.status === 'success' ? '成功' : '部分失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadUserFile } from 'element-plus'

const loading = ref(false)
const fileList = ref<UploadUserFile[]>([])
const uploadRef = ref()

const importHistory = ref([
  { batchNo: 'BATCH20260309001', fileName: '2026 年 3 月打卡记录.xlsx', recordCount: 500, successCount: 498, failCount: 2, importedBy: '张伟', importedAt: '2026-03-09 09:00:00', status: 'success' },
  { batchNo: 'BATCH20260308001', fileName: '2026 年 3 月 8 日打卡.csv', recordCount: 250, successCount: 245, failCount: 5, importedBy: '李娜', importedAt: '2026-03-08 18:30:00', status: 'partial' }
])

const handleDownloadTemplate = () => {
  ElMessage.info('下载模板功能开发中')
}

const handleUpload = () => {
  uploadRef.value?.$el.querySelector('input[type="file"]').click()
}

const handleFileChange = (file: UploadUserFile) => {
  fileList.value = [file]
}

const handleConfirmUpload = async () => {
  if (!fileList.value.length) return
  
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  loading.value = false
  
  ElMessage.success('导入成功')
  fileList.value = []
}
</script>

<style scoped lang="scss">
.attendance-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;

  .header-left {
    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #272b30;
      margin: 0 0 8px 0;
    }

    .page-subtitle {
      font-size: 14px;
      color: #9a9fa5;
    }
  }
}

.upload-card {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .upload-actions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}

.table-card {
  background: #fcfcfc;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #272b30;
    margin: 0 0 16px 0;
  }
}
</style>
