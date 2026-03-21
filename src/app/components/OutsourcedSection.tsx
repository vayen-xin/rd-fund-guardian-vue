import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface OutsourcedItem {
  id: string;
  outsourced_name: string;
  original_amount: number; // 原始金额
  discount_rate: number; // 折扣率，默认0.8
  amount: number; // 折后金额 = original_amount * discount_rate
}

interface OutsourcedSectionProps {
  items: OutsourcedItem[];
  onChange: (items: OutsourcedItem[]) => void;
}

export function OutsourcedSection({ items, onChange }: OutsourcedSectionProps) {
  const addItem = () => {
    const newItem: OutsourcedItem = {
      id: Date.now().toString(),
      outsourced_name: "",
      original_amount: 0,
      discount_rate: 0.8, // 默认80%
      amount: 0,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, item: OutsourcedItem) => {
    const newItems = [...items];
    // 计算折后金额
    const discounted = item.original_amount * (item.discount_rate || 0.8);
    newItems[index] = {
      ...item,
      amount: discounted,
    };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const totalOriginal = items.reduce((sum, item) => sum + item.original_amount, 0);
  const totalDiscount = totalOriginal - totalAmount;

  return (
    <Card className="border-orange-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">委托外部研发费用</h3>
          <span className="text-sm text-orange-600 font-medium">按80%计入成本</span>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> 添加外包
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无外包费用，请添加
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>外包项目名称</Label>
                    <Input
                      value={item.outsourced_name}
                      onChange={(e) => updateItem(idx, { ...item, outsourced_name: e.target.value })}
                      placeholder="例如：算法外包服务"
                    />
                  </div>
                  <div>
                    <Label>原始金额(元)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.original_amount}
                      onChange={(e) => updateItem(idx, { ...item, original_amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>折扣率</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={item.discount_rate}
                      onChange={(e) => updateItem(idx, { ...item, discount_rate: parseFloat(e.target.value) || 0.8 })}
                    />
                  </div>
                  <div>
                    <Label>折后金额(元)</Label>
                    <div className="h-10 px-3 py-2 rounded-md border bg-muted/50 flex items-center">
                      <span className="font-medium text-primary">
                        {item.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  折扣说明：原始金额 {item.original_amount.toFixed(2)} 元 × { (item.discount_rate * 100).toFixed(0) }% = {item.amount.toFixed(2)} 元（可税前扣除）
                </div>

                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-4 w-4 mr-1" /> 删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t pt-3 mt-3 text-right bg-orange-50 p-3 rounded">
            <div className="text-sm text-muted-foreground">
              原始总额：{totalOriginal.toFixed(2)} 元 | 折扣合计：{totalDiscount.toFixed(2)} 元
            </div>
            <div className="text-2xl font-bold text-orange-600">
              外包费用计入成本：{totalAmount.toFixed(2)} 元
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
