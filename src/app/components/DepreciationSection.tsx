import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface DepreciationItem {
  id: string;
  device_name: string;
  deviceId?: number;
  purchase_price: number;
  useful_life_years: number;
  monthly_depreciation: number; // 每月折旧 = purchase_price / (useful_life_years * 12)
  amount: number; // 本月折旧 = monthly_depreciation * 使用月数（简化）
}

interface DeviceOption {
  id: number;
  deviceName: string;
  purchasePrice?: number;
  usefulLifeYears?: number;
}

interface DepreciationSectionProps {
  items: DepreciationItem[];
  onChange: (items: DepreciationItem[]) => void;
  companyId?: number;
}

export function DepreciationSection({ items, onChange, companyId }: DepreciationSectionProps) {
  const [devices, setDevices] = useState<DeviceOption[]>([]);

  useEffect(() => {
    if (companyId) {
      loadDevices();
    }
  }, [companyId]);

  const loadDevices = async () => {
    try {
      const res = await fetch(`/api/v1/devices?companyId=${companyId}`);
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (error) {
      console.error("加载设备列表失败", error);
    }
  };

  const addItem = () => {
    const newItem: DepreciationItem = {
      id: Date.now().toString(),
      device_name: "",
      purchase_price: 0,
      useful_life_years: 5,
      monthly_depreciation: 0,
      amount: 0,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, item: DepreciationItem) => {
    const newItems = [...items];
    // 计算月折旧
    const monthlyDep = item.purchase_price / (item.useful_life_years * 12);
    newItems[index] = {
      ...item,
      monthly_depreciation: monthlyDep,
      amount: monthlyDep, // 简化：按1个月计算，实际上应根据使用月数调整
    };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleDeviceSelect = (index: number, deviceId: string) => {
    const device = devices.find(d => d.id === parseInt(deviceId));
    if (device) {
      updateItem(index, {
        ...items[index],
        deviceId: device.id,
        device_name: device.deviceName,
        purchase_price: device.purchasePrice || 0,
        useful_life_years: device.usefulLifeYears || 5,
      });
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">折旧费用</h3>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> 添加设备
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无折旧费用，请添加
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>选择设备</Label>
                    <Select
                      value={item.deviceId?.toString() || ""}
                      onValueChange={(val) => handleDeviceSelect(idx, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择设备" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map(dev => (
                          <SelectItem key={dev.id} value={dev.id.toString()}>
                            {dev.deviceName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>设备名称</Label>
                    <Input
                      value={item.device_name}
                      onChange={(e) => updateItem(idx, { ...item, device_name: e.target.value })}
                      placeholder="或手动输入"
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
                    <Label>使用年限(年)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.useful_life_years}
                      onChange={(e) => updateItem(idx, { ...item, useful_life_years: parseFloat(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground bg-blue-50 p-2 rounded">
                  月折旧额 = {item.purchase_price.toFixed(2)} / ({item.useful_life_years} × 12) = <span className="font-bold text-primary">{item.monthly_depreciation.toFixed(2)} 元</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    本月折旧：<span className="font-bold text-primary">{item.amount.toFixed(2)} 元</span>
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
            <div className="text-sm text-muted-foreground">折旧费用合计</div>
            <div className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} 元</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
