import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Layout } from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody,TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calculator, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface Settlement {
  id: number;
  settlementMonth: string;
  totalAmount: number;
  status: "pending" | "approved" | "rejected" | "re_settled";
  createdAt: string;
}

export const SettlementPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<{ name: string } | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmReSettle, setConfirmReSettle] = useState<number | null>(null);

  useEffect(() => {
    if (projectId) {
      loadProjectInfo();
      loadSettlements();
    }
  }, [projectId]);

  const loadProjectInfo = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (error) {
      toast.error("加载项目信息失败");
    }
  };

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/settlements/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setSettlements(data);
      }
    } catch (error) {
      toast.error("加载结算记录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSettlement = async () => {
    if (!projectId || !selectedMonth) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/settlements/${projectId}/create?settlementMonth=${selectedMonth}`, {
        method: "POST",
      });
      
      if (response.ok) {
        toast.success("结算成功");
        setDialogOpen(false);
        loadSettlements();
      } else {
        const err = await response.json();
        toast.error(`结算失败: ${err.message || "未知错误"}`);
      }
    } catch (error) {
      toast.error("结算失败");
    } finally {
      setLoading(false);
    }
  };

  const handleReSettle = async (settlementId: number) => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/settlements/${projectId}/re-settle?settlementMonth=${selectedMonth}`, {
        method: "POST",
      });
      
      if (response.ok) {
        toast.success("重算成功");
        setConfirmReSettle(null);
        loadSettlements();
      } else {
        const err = await response.json();
        toast.error(`重算失败: ${err.message || "未知错误"}`);
      }
    } catch (error) {
      toast.error("重算失败");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">待处理</Badge>;
      case "approved":
        return <Badge variant="secondary">已通过</Badge>;
      case "rejected":
        return <Badge variant="destructive">已驳回</Badge>;
      case "re_settled":
        return <Badge>已重算</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">项目结算</h1>
            <p className="text-muted-foreground">
              {project ? `项目: ${project.name}` : "加载中..."}
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calculator className="h-4 w-4 mr-2" />
                新建结算
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建结算</DialogTitle>
                <DialogDescription>
                  为当前项目创建结算单。请确保该月份费用已定稿。
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="month">选择月份</Label>
                  <Input
                    id="month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                <Button onClick={handleCreateSettlement} disabled={loading}>
                  确认结算
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>结算记录</CardTitle>
            <CardDescription>查看所有历史结算单</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : settlements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无结算记录
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>结算月份</TableHead>
                    <TableHead>总金额(元)</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{format(new Date(item.settlementMonth), "yyyy-MM")}</TableCell>
                      <TableCell className="font-medium">
                        {item.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{format(new Date(item.createdAt), "yyyy-MM-dd HH:mm")}</TableCell>
                      <TableCell>
                        {item.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmReSettle(item.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            重算
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 重算确认对话框 */}
        <AlertDialog open={confirmReSettle !== null} onOpenChange={(open) => !open && setConfirmReSettle(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认重算？</AlertDialogTitle>
              <AlertDialogDescription>
                重算将根据最新月度数据重新计算结算金额。确认继续？
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleReSettle(confirmReSettle!)}>
                确认重算
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
