import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Company {
  id?: number;
  name: string;
  code: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<Company>({ name: "", code: "", status: "active" });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/companies");
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (error) {
      toast.error("加载公司列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = editingCompany ? `/api/v1/companies/${editingCompany.id}` : "/api/v1/companies";
      const method = editingCompany ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast.success(editingCompany ? "更新成功" : "创建成功");
        setDialogOpen(false);
        setEditingCompany(null);
        setFormData({ name: "", code: "", status: "active" });
        loadCompanies();
      } else {
        toast.error("操作失败");
      }
    } catch (error) {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除吗？")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/companies/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("删除成功");
        loadCompanies();
      } else {
        toast.error("删除失败");
      }
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({ name: company.name, code: company.code, status: company.status });
    setDialogOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">公司管理</h1>
            <p className="text-muted-foreground">管理系统中的公司信息</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingCompany(null); setFormData({ name: "", code: "", status: "active" }); }}>
                <Plus className="h-4 w-4 mr-2" />
                新增公司
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCompany ? "编辑公司" : "新增公司"}</DialogTitle>
                <DialogDescription>
                  {editingCompany ? "修改公司信息" : "填写公司基本信息"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">公司名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="code">公司编码</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="inactive">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                <Button onClick={handleSave} disabled={loading}>
                  保存
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>公司列表</CardTitle>
            <CardDescription>共 {companies.length} 家公司</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无公司数据
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>公司名称</TableHead>
                    <TableHead>编码</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.code}</TableCell>
                      <TableCell>
                        <Badge variant={company.status === "active" ? "default" : "secondary"}>
                          {company.status === "active" ? "启用" : "停用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(company)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(company.id!)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
