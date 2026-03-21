import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Layout } from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { format, startOfMonth } from "date-fns";
import { zhCN } from "date-fns/locale";
import { FileText } from "lucide-react";
import { LaborSection } from "../components/LaborSection";
import { DirectRentalSection } from "../components/DirectRentalSection";
import { DirectMaterialSection } from "../components/DirectMaterialSection";
import { FuelPowerSection } from "../components/FuelPowerSection";
import { DepreciationSection } from "../components/DepreciationSection";
import { AmortizationSection } from "../components/AmortizationSection";
import { DesignSection } from "../components/DesignSection";
import { CommissioningSection } from "../components/CommissioningSection";
import { OutsourcedSection } from "../components/OutsourcedSection";
import { OtherSection } from "../components/OtherSection";

// 类型定义
interface MonthlyData {
  id?: number;
  workMonth: string;
  costData: CostData;
  grandTotal: number;
  status: "draft" | "finalized" | "settled";
}

interface CostData {
  labor: LaborItem[];
  direct_material: DirectMaterialItem[];
  direct_fuel: DirectFuelItem[];
  direct_rental: DirectRentalItem[];
  depreciation: DepreciationItem[];
  amortization: AmortizationItem[];
  design: DesignItem[];
  commissioning: CommissioningItem[];
  outsourced: OutsourcedItem[];
  other: OtherItem[];
}

interface LaborItem {
  id: string;
  employee_name: string;
  employee_type: "formal" | "part_time";
  coefficient: number;
  salary: { hours: number; amount: number };
  social_security: { hours: number; amount: number };
  housing_fund: { hours: number; amount: number };
}

interface DirectRentalItem {
  id: string;
  device_name: string;
  deviceId?: number;
  rental_days: number;
  daily_rate: number;
  amount: number;
}

interface DirectMaterialItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface DirectFuelItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface DepreciationItem {
  id: string;
  device_name: string;
  deviceId?: number;
  purchase_price: number;
  useful_life_years: number;
  monthly_depreciation: number;
  amount: number;
}

interface AmortizationItem {
  id: string;
  intangible_name: string;
  purchase_price: number;
  useful_life_months: number;
  monthly_amortization: number;
  amount: number;
}

interface DesignItem {
  id: string;
  design_name: string;
  designer: string;
  amount: number;
}

interface CommissioningItem {
  id: string;
  test_name: string;
  tester: string;
  amount: number;
}

interface OutsourcedItem {
  id: string;
  outsourced_name: string;
  original_amount: number;
  discount_rate: number;
  amount: number;
}

interface OtherItem {
  id: string;
  description: string;
  amount: number;
}

export const ProjectMonthlyPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<{ name: string; companyId?: number } | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CostData>({
    labor: [],
    direct_material: [],
    direct_fuel: [],
    direct_rental: [],
    depreciation: [],
    amortization: [],
    design: [],
    commissioning: [],
    outsourced: [],
    other: [],
  });

  useEffect(() => {
    if (projectId) {
      loadProjectInfo();
      loadMonthlyData();
    }
  }, [projectId, selectedMonth]);

  const loadProjectInfo = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject({ name: data.projectName, companyId: data.companyId });
      }
    } catch (error) {
      toast.error("加载项目信息失败");
    }
  };

  const loadMonthlyData = async () => {
    setLoading(true);
    try {
      const monthStr = format(selectedMonth, "yyyy-MM-01");
      const res = await fetch(`/api/v1/projects/${projectId}/monthly/${monthStr}`);
      if (res.ok) {
        const data = await res.json();
        setMonthlyData(data);
        if (data.costData) {
          try {
            setFormData(JSON.parse(data.costData));
          } catch (e) {
            setFormData(emptyFormData);
          }
        } else {
          setFormData(emptyFormData);
        }
      } else {
        setMonthlyData(null);
        setFormData(emptyFormData);
      }
    } catch (error) {
      toast.error("加载月度数据失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const monthStr = format(selectedMonth, "yyyy-MM-01");
      const grandTotal = calculateGrandTotal(formData);
      
      const response = await fetch(`/api/v1/projects/${projectId}/monthly/${monthStr}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          costData: formData,
          grandTotal,
        }),
      });
      
      if (response.ok) {
        toast.success("保存成功");
        setIsDialogOpen(false);
        loadMonthlyData();
      } else {
        const err = await response.json();
        toast.error(`保存失败: ${err.message || "未知错误"}`);
      }
    } catch (error) {
      toast.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  const calculateGrandTotal = (data: CostData): number => {
    let total = 0;
    
    // Labor
    for (const item of data.labor) {
      total += item.salary.amount + item.social_security.amount + item.housing_fund.amount;
    }
    
    // Direct categories
    for (const item of data.direct_material) total += item.amount;
    for (const item of data.direct_fuel) total += item.amount;
    for (const item of data.direct_rental) total += item.amount;
    for (const item of data.depreciation) total += item.amount;
    for (const item of data.amortization) total += item.amount;
    for (const item of data.design) total += item.amount;
    for (const item of data.commissioning) total += item.amount;
    for (const item of data.outsourced) total += item.amount;
    for (const item of data.other) total += item.amount;
    
    return total;
  };

  const handleMonthChange = (date: Date | undefined) => {
    if (date) {
      setSelectedMonth(startOfMonth(date));
    }
  };

  const grandTotal = calculateGrandTotal(formData);
  const isDraft = monthlyData?.status === "draft";

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">项目月度费用</h1>
            <p className="text-muted-foreground">
              {project ? `项目: ${project.name}` : "加载中..."}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <Calendar
                value={selectedMonth}
                onSelect={handleMonthChange}
                mode="single"
                locale={zhCN}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  录入费用
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    编辑月度费用
                  </DialogTitle>
                  <DialogDescription>
                    {format(selectedMonth, "yyyy年 MM月")} · 请填写所有费用类别
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="labor" className="mt-4">
                  <TabsList className="grid grid-cols-5 h-auto">
                    <TabsTrigger value="labor">人员</TabsTrigger>
                    <TabsTrigger value="direct">直接投入</TabsTrigger>
                    <TabsTrigger value="depreciation">折旧摊销</TabsTrigger>
                    <TabsTrigger value="design">设计调试</TabsTrigger>
                    <TabsTrigger value="other">其他</TabsTrigger>
                  </TabsList>
                  
                  {/* 第一组：人员人工 */}
                  <TabsContent value="labor" className="mt-4">
                    <LaborSection 
                      items={formData.labor} 
                      onChange={(labor) => setFormData({ ...formData, labor })} 
                    />
                  </TabsContent>
                  
                  {/* 第二组：直接投入 */}
                  <TabsContent value="direct" className="mt-4 space-y-4">
                    <DirectMaterialSection 
                      items={formData.direct_material}
                      onChange={(direct_material) => setFormData({ ...formData, direct_material })}
                    />
                    <FuelPowerSection 
                      items={formData.direct_fuel}
                      onChange={(direct_fuel) => setFormData({ ...formData, direct_fuel })}
                    />
                    <DirectRentalSection 
                      items={formData.direct_rental}
                      onChange={(direct_rental) => setFormData({ ...formData, direct_rental })}
                      companyId={project?.companyId}
                    />
                  </TabsContent>
                  
                  {/* 第三组：折旧摊销 */}
                  <TabsContent value="depreciation" className="mt-4 space-y-4">
                    <DepreciationSection 
                      items={formData.depreciation}
                      onChange={(depreciation) => setFormData({ ...formData, depreciation })}
                      companyId={project?.companyId}
                    />
                    <AmortizationSection 
                      items={formData.amortization}
                      onChange={(amortization) => setFormData({ ...formData, amortization })}
                    />
                  </TabsContent>
                  
                  {/* 第四组：设计调试 */}
                  <TabsContent value="design" className="mt-4 space-y-4">
                    <DesignSection 
                      items={formData.design}
                      onChange={(design) => setFormData({ ...formData, design })}
                    />
                    <CommissioningSection 
                      items={formData.commissioning}
                      onChange={(commissioning) => setFormData({ ...formData, commissioning })}
                    />
                  </TabsContent>
                  
                  {/* 第五组：其他 */}
                  <TabsContent value="other" className="mt-4 space-y-4">
                    <OutsourcedSection 
                      items={formData.outsourced}
                      onChange={(outsourced) => setFormData({ ...formData, outsourced })}
                    />
                    <OtherSection 
                      items={formData.other}
                      onChange={(other) => setFormData({ ...formData, other })}
                    />
                  </TabsContent>
                </Tabs>
                
                <div className="border-t pt-4 mt-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">本月费用总计</div>
                      <div className="text-3xl font-bold text-primary">
                        {grandTotal.toFixed(2)} 元
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>取消</Button>
                      <Button onClick={handleSave} disabled={loading || grandTotal === 0}>
                        保存并提交
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">当前月份</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(selectedMonth, "yyyy-MM")}
              </div>
              <div className="text-sm text-muted-foreground">
                状态: {getStatusText(monthlyData?.status)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">本月费用</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {monthlyData ? monthlyData.grandTotal.toFixed(2) : "0.00"} 元
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {monthlyData?.status === "finalized" && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/projects/${projectId}/settlement`)}
                >
                  去结算
                </Button>
              )}
              {monthlyData?.status === "draft" && (
                <Button 
                  className="w-full"
                  onClick={() => setIsDialogOpen(true)}
                >
                  继续编辑
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 历史数据表格 */}
        <Card>
          <CardHeader>
            <CardTitle>历史月度数据</CardTitle>
            <CardDescription>查看和管理所有月份的费用记录</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">加载中...</div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                暂无历史数据
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function getStatusText(status?: string) {
  switch (status) {
    case "draft": return "草稿";
    case "finalized": return "已定稿";
    case "settled": return "已结算";
    default: return "未录入";
  }
}

const emptyFormData: CostData = {
  labor: [],
  direct_material: [],
  direct_fuel: [],
  direct_rental: [],
  depreciation: [],
  amortization: [],
  design: [],
  commissioning: [],
  outsourced: [],
  other: [],
};
