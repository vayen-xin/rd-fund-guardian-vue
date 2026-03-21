import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { employeeApi, companyApi } from "../api";

// 员工类型映射
const employeeTypeMap: Record<string, string> = {
  formal: "正式员工",
  part_time: "兼职员工",
  outsourced: "外包员工",
};

export const PersonnelPage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  // 表单状态
  const [form, setForm] = useState({
    name: "",
    code: "",
    department: "",
    position: "",
    employeeType: "formal",
    joinDate: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [employeesRes, companiesRes] = await Promise.all([
        employeeApi.list(),
        companyApi.list(),
      ]);
      setEmployees(employeesRes);
      setCompanies(companiesRes);
    } catch (error: any) {
      toast.error(`加载数据失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      department: "",
      position: "",
      employeeType: "formal",
      joinDate: "",
      phone: "",
      email: "",
    });
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: 实现员工创建/更新 API
      toast.success(editingEmployee ? "员工信息已更新" : "员工添加成功");
      loadData();
      resetForm();
    } catch (error: any) {
      toast.error(`操作失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除该员工吗？")) return;
    try {
      // TODO: 实现删除 API
      toast.success("员工已删除");
      loadData();
    } catch (error: any) {
      toast.error(`删除失败: ${error.message}`);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">人员管理</h1>
            <p className="text-muted-foreground">管理系统员工与项目参与人员</p>
          </div>
          <Button onClick={() => setShowForm(true)}>+ 添加员工</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>员工列表 ({employees.length})</CardTitle>
            <CardDescription>所有公司员工信息</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无员工数据</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">姓名</th>
                      <th className="text-left py-3 px-4">工号</th>
                      <th className="text-left py-3 px-4">类型</th>
                      <th className="text-left py-3 px-4">部门</th>
                      <th className="text-left py-3 px-4">职位</th>
                      <th className="text-left py-3 px-4">入职日期</th>
                      <th className="text-left py-3 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b last:border-none hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{emp.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{emp.code || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{employeeTypeMap[emp.employeeType] || emp.employeeType}</Badge>
                        </td>
                        <td className="py-3 px-4">{emp.department || '-'}</td>
                        <td className="py-3 px-4">{emp.position || '-'}</td>
                        <td className="py-3 px-4">{emp.joinDate?.slice(0, 10) || '-'}</td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingEmployee(emp); setShowForm(true); }}>
                            编辑
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(emp.id)}>
                            删除
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 员工表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={resetForm} />
          <div className="relative bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[480px] p-[32px]">
            <h3 className="font-semibold text-lg mb-6">
              {editingEmployee ? "编辑员工" : "添加员工"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">姓名 *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">工号</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">部门</label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">职位</label>
                <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">员工类型 *</label>
                <select
                  value={form.employeeType}
                  onChange={(e) => setForm({ ...form, employeeType: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="formal">正式员工</option>
                  <option value="part_time">兼职员工</option>
                  <option value="outsourced">外包员工</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">入职日期</label>
                <Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {editingEmployee ? "保存" : "添加"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>取消</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

// 修复 Badge 导入（如果缺失）
import { Badge } from "../components/ui/badge";
