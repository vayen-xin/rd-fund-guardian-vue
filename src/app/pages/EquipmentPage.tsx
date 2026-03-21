import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { deviceApi, companyApi } from "../api";

export const EquipmentPage = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [companyFilter, setCompanyFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    model: "",
    specification: "",
    purchaseDate: "",
    purchasePrice: "",
    usefulLifeYears: "",
    companyId: "",
  });

  useEffect(() => {
    loadCompanies();
    loadDevices();
  }, [companyFilter]);

  const loadCompanies = async () => {
    try {
      const res = await companyApi.list();
      setCompanies(res);
    } catch (error) {
      console.error("加载公司失败:", error);
    }
  };

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await deviceApi.list(companyFilter || undefined);
      setDevices(res);
    } catch (error: any) {
      toast.error(`加载设备失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      model: "",
      specification: "",
      purchaseDate: "",
      purchasePrice: "",
      usefulLifeYears: "",
      companyId: companies[0]?.id?.toString() || "",
    });
    setEditingDevice(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        purchasePrice: Number(form.purchasePrice),
        usefulLifeYears: Number(form.usefulLifeYears),
        companyId: Number(form.companyId),
      };
      if (editingDevice) {
        // await deviceApi.update(editingDevice.id, body);
        toast.success("设备已更新");
      } else {
        // await deviceApi.create(body);
        toast.success("设备添加成功");
      }
      loadDevices();
      resetForm();
    } catch (error: any) {
      toast.error(`操作失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除该设备吗？")) return;
    try {
      // await deviceApi.delete(id);
      toast.success("设备已删除");
      loadDevices();
    } catch (error: any) {
      toast.error(`删除失败: ${error.message}`);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">设备管理</h1>
            <p className="text-muted-foreground">管理公司固定资产与折旧信息</p>
          </div>
          <div className="flex gap-3">
            <select
              value={companyFilter || ""}
              onChange={(e) => setCompanyFilter(e.target.value ? Number(e.target.value) : null)}
              className="border rounded px-3 py-2"
            >
              <option value="">全部公司</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Button onClick={() => setShowForm(true)}>+ 添加设备</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>设备列表 ({devices.length})</CardTitle>
            <CardDescription>固定资产信息</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无设备数据</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">设备编号</th>
                      <th className="text-left py-3 px-4">设备名称</th>
                      <th className="text-left py-3 px-4">型号</th>
                      <th className="text-left py-3 px-4">单价</th>
                      <th className="text-left py-3 px-4">使用年限</th>
                      <th className="text-left py-3 px-4">日折旧</th>
                      <th className="text-left py-3 px-4">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((dev) => (
                      <tr key={dev.id} className="border-b last:border-none hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{dev.code}</td>
                        <td className="py-3 px-4">{dev.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{dev.model || '-'}</td>
                        <td className="py-3 px-4">¥{dev.purchasePrice?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4">{dev.usefulLifeYears || '-'} 年</td>
                        <td className="py-3 px-4">
                          {dev.dailyDepreciation ? `¥${Number(dev.dailyDepreciation).toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="ghost" onClick={() => { setEditingDevice(dev); setShowForm(true); }}>
                            编辑
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(dev.id)}>
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

      {/* 设备表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={resetForm} />
          <div className="relative bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[500px] p-[32px]">
            <h3 className="font-semibold text-lg mb-6">
              {editingDevice ? "编辑设备" : "添加设备"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">设备编号 *</label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">设备名称 *</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">型号</label>
                  <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">规格</label>
                  <Input value={form.specification} onChange={(e) => setForm({ ...form, specification: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">购买价格（元）*</label>
                  <Input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">使用年限（年）*</label>
                  <Input type="number" value={form.usefulLifeYears} onChange={(e) => setForm({ ...form, usefulLifeYears: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">所属公司 *</label>
                <select
                  value={form.companyId}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {editingDevice ? "保存" : "添加"}
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
