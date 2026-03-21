import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Layout } from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { projectApi } from "../api";

// 类型定义
type ProjectStatus = "pending" | "ongoing" | "ended" | "settled";

type Project = {
  id: number;
  name: string;
  code: string;
  description: string;
  startDate: string;
  endDate: string | null;
  status: ProjectStatus;
  createdAt: string;
  createdBy: string;
  managerPhone?: string;
};

// 状态显示映射
const statusLabels: Record<ProjectStatus, string> = {
  pending: "待开始",
  ongoing: "进行中",
  ended: "已结束",
  settled: "已结算",
};

const statusColors: Record<ProjectStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  ongoing: "default",
  ended: "outline",
  settled: "default",
};

const PAGE_SIZE = 10;

export const ProjectListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    loadProjects();
  }, [page, statusFilter, nameFilter]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res: any = await projectApi.list({
        page,
        size: PAGE_SIZE,
        ...(statusFilter && { status: statusFilter }),
        ...(nameFilter && { name: nameFilter }),
      });
      setProjects(res.records || []);
      setTotal(res.total || 0);
    } catch (error: any) {
      toast.error(`加载项目失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除该项目吗？")) return;
    try {
      await projectApi.delete(id);
      toast.success("删除成功");
      loadProjects();
    } catch (error: any) {
      toast.error(`删除失败: ${error.message}`);
    }
  };

  const handleStatusChange = async (id: number, newStatus: ProjectStatus) => {
    try {
      await projectApi.updateStatus(id, newStatus);
      toast.success("状态更新成功");
      loadProjects();
    } catch (error: any) {
      toast.error(`更新失败: ${error.message}`);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">项目管理</h1>
            <p className="text-muted-foreground">管理您的研发项目及其月度费用数据</p>
          </div>
          <Button onClick={() => navigate("/projects/create")}>+ 新建项目</Button>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardHeader>
            <CardTitle>筛选</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="项目名称..."
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value);
                  setPage(1);
                }}
                className="max-w-xs"
              />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="border rounded px-3 py-2"
              >
                <option value="">全部状态</option>
                <option value="pending">待开始</option>
                <option value="ongoing">进行中</option>
                <option value="ended">已结束</option>
                <option value="settled">已结算</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 项目列表 */}
        <Card>
          <CardHeader>
            <CardTitle>项目列表 ({total})</CardTitle>
            <CardDescription>点击项目进入详情，管理月度费用与结算</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">加载中...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">暂无项目，请先创建</div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition"
                    onClick={() => navigate(`/projects/${project.id}/monthly`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{project.name}</h3>
                          <Badge variant={statusColors[project.status]}>
                            {statusLabels[project.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description || "暂无描述"}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          {project.code && <span>编码: {project.code}</span>}
                          <span className="ml-4">创建: {project.createdAt?.slice(0, 10)}</span>
                          <span className="ml-4">负责人: {project.createdBy}</span>
                        </div>
                      </div>
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/projects/${project.id}/monthly`)}
                        >
                          费用
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/projects/${project.id}/settlement`)}
                        >
                          结算
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/projects/${project.id}/edit`)}
                        >
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(project.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>

                    {/* 快速状态变更 */}
                    <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(project.id, e.target.value as ProjectStatus)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="pending">设为 待开始</option>
                        <option value="ongoing">设为 进行中</option>
                        <option value="ended">设为 已结束</option>
                        <option value="settled">设为 已结算</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  上一页
                </Button>
                <span className="py-2 text-sm">
                  第 {page} / {totalPages} 页 (共 {total} 条)
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
