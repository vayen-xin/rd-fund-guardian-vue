import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface LaborItem {
  id: string;
  employee_name: string;
  employee_type: "formal" | "part_time";
  coefficient: number;
  salary: { hours: number; amount: number };
  social_security: { hours: number; amount: number };
  housing_fund: { hours: number; amount: number };
}

interface LaborSectionProps {
  items: LaborItem[];
  onChange: (items: LaborItem[]) => void;
}

export function LaborSection({ items, onChange }: LaborSectionProps) {
  const addItem = () => {
    const newItem: LaborItem = {
      id: Date.now().toString(),
      employee_name: "",
      employee_type: "formal",
      coefficient: 0.75,
      salary: { hours: 0, amount: 0 },
      social_security: { hours: 0, amount: 0 },
      housing_fund: { hours: 0, amount: 0 },
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, item: LaborItem) => {
    const newItems = [...items];
    newItems[index] = item;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => 
    sum + item.salary.amount + item.social_security.amount + item.housing_fund.amount, 0
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">人员人工费用</h3>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> 添加员工
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无人员费用，请添加
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div>
                      <Label>员工姓名</Label>
                      <Input
                        value={item.employee_name}
                        onChange={(e) => updateItem(idx, { ...item, employee_name: e.target.value })}
                        placeholder="张三"
                      />
                    </div>
                    <div>
                      <Label>员工类型</Label>
                      <Select
                        value={item.employee_type}
                        onValueChange={(value: "formal" | "part_time") => updateItem(idx, { ...item, employee_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">正式员工</SelectItem>
                          <SelectItem value="part_time">兼职员工</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>工时系数 ({item.coefficient * 100}%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={item.coefficient}
                        onChange={(e) => updateItem(idx, { ...item, coefficient: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>工资 - 工时(小时)</Label>
                    <Input
                      type="number"
                      value={item.salary.hours}
                      onChange={(e) => updateItem(idx, { 
                        ...item, 
                        salary: { ...item.salary, hours: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label>工资 - 金额(元)</Label>
                    <Input
                      type="number"
                      value={item.salary.amount}
                      onChange={(e) => updateItem(idx, { 
                        ...item, 
                        salary: { ...item.salary, amount: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    小计: {(item.salary.hours * item.coefficient * 100).toFixed(0)}元
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>社保 - 工时(小时)</Label>
                    <Input
                      type="number"
                      value={item.social_security.hours}
                      onChange={(e) => updateItem(idx, { 
                        ...item, 
                        social_security: { ...item.social_security, hours: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label>社保 - 金额(元)</Label>
                    <Input
                      type="number"
                      value={item.social_security.amount}
                      onChange={(e) => updateItem(idx, { 
                        ...item, 
                        social_security: { ...item.social_security, amount: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>公积金 - 工时(小时)</Label>
                    <Input
                      type="number"
                      value={item.housing_fund.hours}
                      onChange={(e) => updateItem(idx, { 
                        ...item, 
                        housing_fund: { ...item.housing_fund, hours: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label>公积金 - 金额(元)</Label>
                    <Input
                      type="number"
                      value={item.housing_fund.amount}
                      onChange={(e) => updateItem(idx, { 
                        ...item, 
                        housing_fund: { ...item.housing_fund, amount: parseFloat(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>

                <div className="border-t pt-2 mt-2 text-right">
                  <span className="text-sm font-medium">
                    该员工合计: {(item.salary.amount + item.social_security.amount + item.housing_fund.amount).toFixed(2)} 元
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t pt-3 mt-3 text-right">
            <div className="text-sm text-muted-foreground">
              人员人工费用合计
            </div>
            <div className="text-2xl font-bold text-primary">
              {totalAmount.toFixed(2)} 元
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
