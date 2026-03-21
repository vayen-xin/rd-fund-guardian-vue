import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface AmortizationItem {
  id: string;
  intangible_name: string;
  purchase_price: number;
  useful_life_months: number;
  monthly_amortization: number;
  amount: number;
}

interface AmortizationSectionProps {
  items: AmortizationItem[];
  onChange: (items: AmortizationItem[]) => void;
}

export function AmortizationSection({ items, onChange }: AmortizationSectionProps) {
  const addItem = () => {
    const newItem: AmortizationItem = {
      id: Date.now().toString(),
      intangible_name: "",
      purchase_price: 0,
      useful_life_months: 12,
      monthly_amortization: 0,
      amount: 0,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, item: AmortizationItem) => {
    const newItems = [...items];
    const monthlyAmort = item.purchase_price / item.useful_life_months;
    newItems[index] = {
      ...item,
      monthly_amortization: monthlyAmort,
      amount: monthlyAmort, // 简化：本月摊销
    };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">无形资产摊销</h3>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> 添加无形资产
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无无形资产摊销，请添加
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>资产名称</Label>
                    <Input
                      value={item.intangible_name}
                      onChange={(e) => updateItem(idx, { ...item, intangible_name: e.target.value })}
                      placeholder="例如：软件著作权"
                    />
                  </div>
                  <div>
                    <Label>购买价格(元)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.purchase_price}
                      onChange={(e) => updateItem(idx, { ...item, purchase_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>使用期限(月)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.useful_life_months}
                      onChange={(e) => updateItem(idx, { ...item, useful_life_months: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                  月摊销额 = {item.purchase_price.toFixed(2)} / {item.useful_life_months} = <span className="font-bold text-primary">{item.monthly_amortization.toFixed(2)} 元</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    本月摊销：<span className="font-bold text-primary">{item.amount.toFixed(2)} 元</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t pt-3 mt-3 text-right">
            <div className="text-sm text-muted-foreground">无形资产摊销合计</div>
            <div className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} 元</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
