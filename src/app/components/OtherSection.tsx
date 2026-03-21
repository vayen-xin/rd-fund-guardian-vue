import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface OtherItem {
  id: string;
  description: string;
  amount: number;
}

interface OtherSectionProps {
  items: OtherItem[];
  onChange: (items: OtherItem[]) => void;
}

export function OtherSection({ items, onChange }: OtherSectionProps) {
  const addItem = () => {
    const newItem: OtherItem = {
      id: Date.now().toString(),
      description: "",
      amount: 0,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, item: OtherItem) => {
    const newItems = [...items];
    newItems[index] = item;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="border-red-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">其他费用</h3>
          <span className="text-sm text-red-600 font-medium">占比需 ≤ 20%</span>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> 添加费用
          </Button>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
          <div className="text-sm text-yellow-800">
            <strong>注意：</strong>其他费用（如办公费、差旅费、会议费等）占总成本比例不能超过20%。系统将自动校验。
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无其他费用，请添加
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>费用说明</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(idx, { ...item, description: e.target.value })}
                      placeholder="例如：办公用品、差旅费"
                    />
                  </div>
                  <div>
                    <Label>金额(元)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) => updateItem(idx, { ...item, amount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
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
          <div className="border-t pt-3 mt-3 text-right bg-red-50 p-3 rounded">
            <div className="text-sm text-muted-foreground">
              其他费用合计
            </div>
            <div className="text-2xl font-bold text-red-600">
              {totalAmount.toFixed(2)} 元
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              提交时将校验占比 ≤ 20%
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
