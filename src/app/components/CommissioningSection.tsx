import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface CommissioningItem {
  id: string;
  test_name: string;
  tester: string;
  amount: number;
}

interface CommissioningSectionProps {
  items: CommissioningItem[];
  onChange: (items: CommissioningItem[]) => void;
}

export function CommissioningSection({ items, onChange }: CommissioningSectionProps) {
  const addItem = () => {
    const newItem: CommissioningItem = {
      id: Date.now().toString(),
      test_name: "",
      tester: "",
      amount: 0,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, item: CommissioningItem) => {
    const newItems = [...items];
    newItems[index] = item;
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
          <h3 className="text-lg font-semibold">装备调试与试验费</h3>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> 添加试验
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无调试试验费用，请添加
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>试验/调试名称</Label>
                    <Input
                      value={item.test_name}
                      onChange={(e) => updateItem(idx, { ...item, test_name: e.target.value })}
                      placeholder="例如：性能测试、稳定性测试"
                    />
                  </div>
                  <div>
                    <Label>测试人员</Label>
                    <Input
                      value={item.tester}
                      onChange={(e) => updateItem(idx, { ...item, tester: e.target.value })}
                      placeholder="测试人员姓名"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>费用金额(元)</Label>
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
          <div className="border-t pt-3 mt-3 text-right">
            <div className="text-sm text-muted-foreground">调试试验费合计</div>
            <div className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} 元</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
