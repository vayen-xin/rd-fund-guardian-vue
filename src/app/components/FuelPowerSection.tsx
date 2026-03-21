import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface FuelPowerItem {
  id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface FuelPowerSectionProps {
  items: FuelPowerItem[];
  onChange: (items: FuelPowerItem[]) => void;
}

export function FuelPowerSection({ items, onChange }: FuelPowerSectionProps) {
  const addItem = () => {
    const newItem: FuelPowerItem = {
      id: Date.now().toString(),
      item_name: "",
      quantity: 0,
      unit_price: 0,
      amount: 0,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, item: FuelPowerItem) => {
    const newItems = [...items];
    newItems[index] = {
      ...item,
      amount: (item.quantity || 0) * (item.unit_price || 0)
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
          <h3 className="text-lg font-semibold">直接投入 - 燃料动力费</h3>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> 添加燃料动力
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无燃料动力费用，请添加
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>燃料/电力类型</Label>
                    <Input
                      value={item.item_name}
                      onChange={(e) => updateItem(idx, { ...item, item_name: e.target.value })}
                      placeholder="例如：电力、汽油"
                    />
                  </div>
                  <div>
                    <Label>单位</Label>
                    <Input
                      value={item.unit_price ? "元" : ""}
                      readOnly
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <Label>用量</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, { ...item, quantity: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>单价(元)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateItem(idx, { ...item, unit_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    小计：<span className="font-bold text-primary">{item.amount.toFixed(2)} 元</span>
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
            <div className="text-sm text-muted-foreground">燃料动力费合计</div>
            <div className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} 元</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
