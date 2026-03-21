import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent } from "../components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface DirectRentalItem {
  id: string;
  device_name: string;
  deviceId?: number; // 关联设备ID
  rental_days: number;
  daily_rate: number;
  amount: number; // rental_days * daily_rate（自动计算）
}

interface DeviceOption {
  id: number;
  deviceName: string;
  dailyDepreciation?: number;
  monthlyRental?: number;
}

interface DirectRentalSectionProps {
  items: DirectRentalItem[];
  onChange: (items: DirectRentalItem[]) => void;
  companyId?: number; // 用于加载设备列表
}

export function DirectRentalSection({ items, onChange, companyId }: DirectRentalSectionProps) {
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
    const newItem: DirectRentalItem = {
      id: Date.now().toString(),
      device_name: "",
      rental_days: 0,
      daily_rate: 0,
      amount: 0,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, item: DirectRentalItem) => {
    const newItems = [...items];
    newItems[index] = { 
      ...item, 
      amount: (item.rental_days || 0) * (item.daily_rate || 0) 
    };
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleDeviceSelect = (index: number, deviceId: string) => {
    const device = devices.find(d => d.id === parseInt(deviceId));
    if (device) {
      const item = items[index];
      updateItem(index, {
        ...item,
        deviceId: device.id,
        device_name: device.deviceName,
        daily_rate: device.dailyDepreciation || device.monthlyRental || 0,
      });
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">直接投入 - 设备租赁费</h3>
          <Button size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> 添加设备
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无设备租赁记录，请添加
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-3 flex-1">
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
                      <Label>设备名称（自定义）</Label>
                      <Input
                        value={item.device_name}
                        onChange={(e) => updateItem(idx, { ...item, device_name: e.target.value })}
                        placeholder="或输入设备名称"
                      />
                    </div>
                    <div>
                      <Label>租赁天数</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.rental_days}
                        onChange={(e) => updateItem(idx, { ...item, rental_days: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>日均租金(元/天)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.daily_rate}
                        onChange={(e) => updateItem(idx, { ...item, daily_rate: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="text-right text-sm">
                  该设备租赁费用：<span className="font-bold text-primary">{item.amount.toFixed(2)} 元</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t pt-3 mt-3 text-right">
            <div className="text-sm text-muted-foreground">
              设备租赁费合计
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
