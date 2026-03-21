import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Layout } from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { companyApi, employeeApi, deviceApi, projectApi } from "../api";

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);

  // 表单状态
  const [companyId, setCompanyId] = useState<number>(user?.companyId || 0);
  const [projectName, setProjectName] = useState("");
  const [code, setCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [description, setDescription] = useState("");
  const [managerPhone, setManagerPhone] = useState("");

  // 选中的员工和设备（ID列表）
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);

  useEffect(() => {
    loadSelectData();
  }, []);

  const loadSelectData = async () => {
    try {
      const [companiesRes, employeesRes, devicesRes] = await Promise.all([
        companyApi.list(),
        employeeApi.list(),
        deviceApi.list(companyId || undefined),
      ]);
      setCompanies(companiesRes);
      setEmployees(employeesRes);
      setDevices(devicesRes);
    } catch (error: any) {
      toast.error(`加载选择数据失败: ${error.message}`);
    }
  };

  // 当 companyId 变化时，重新加载设备列表
  useEffect(() => {
    if (companyId) {
      deviceApi.list(companyId).then(setDevices).catch(() => setDevices([]));
    }
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 创建项目
      const createRes: any = await projectApi.create({
        companyId,
        projectName,
        code,
        startDate,
        description,
        managerPhone,
      });

      const projectId = createRes.data?.id || createRes.id;
      if (!projectId) throw new Error("创建项目失败，未返回ID");

      // 2. 批量关联员工
      if (selectedEmployees.length > 0) {
        await Promise.all(
          selectedEmployees.map((empId) =>
            employeeApi.projectAdd(projectId, { employeeId: empId, coefficient: 0.7 })
          )
        );
      }

      // 3. 批量关联设备
      if (selectedDevices.length > 0) {
        await Promise.all(
          selectedDevices.map((deviceId) =>
            projectApi.addDevice?.(projectId, { deviceId }) // 需要后端支持
          )
        );
      }

      toast.success("项目创建成功！");
      navigate(`/projects/${projectId}/monthly`);
    } catch (error: any) {
      toast.error(`创建失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleEmployee = (empId: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const toggleDevice = (deviceId: number) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
    );
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">新建项目</h1>
          <p className="text-muted-foreground">填写项目基本信息，并关联员工与设备</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>项目信息</CardTitle>
            <CardDescription>带 * 为必填项</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 公司（仅管理员可见） */}
              {user?.role === "admin" && (
                <div>
                  <label className="block text-sm font-medium mb-1">公司</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">项目名称 *</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="请输入项目名称"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">项目编码</label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="如：RD-2026-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">开始日期 *</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">项目描述</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="简要描述项目的目标和范围"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">负责人电话</label>
                <Input
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  placeholder="可选"
                />
              </div>

              {/* 员工选择 */}
              <div>
                <label className="block text-sm font-medium mb-2">关联员工</label>
                <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-2">
                  {employees.length === 0 ? (
                    <div className="text-muted-foreground text-sm">暂无员工数据，请先添加员工</div>
                  ) : (
                    employees.map((emp) => (
                      <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp.id)}
                          onChange={() => toggleEmployee(emp.id)}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {emp.name} ({emp.role === 'admin' ? '管理员' : emp.role === 'branch_admin' ? '分公司管理员' : '员工'})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* 设备选择 */}
              <div>
                <label className="block text-sm font-medium mb-2">关联设备</label>
                <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-2">
                  {devices.length === 0 ? (
                    <div className="text-muted-foreground text-sm">暂无设备数据，请先添加设备</div>
                  ) : (
                    devices.map((dev) => (
                      <label key={dev.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDevices.includes(dev.id)}
                          onChange={() => toggleDevice(dev.id)}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {dev.name} (日折旧: ¥{dev.dailyDepreciation?.toFixed(2) || dev.purchasePrice ? '待计算' : 'N/A'})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "创建中..." : "创建项目"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
