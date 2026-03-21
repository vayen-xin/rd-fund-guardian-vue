import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router";

// ─── Types ─────────────────────────────────────────────────────────────────
type EmpRef  = { employeeId: string; name: string; type: string; };
type DevRef  = { deviceId: string;  name: string; depreciationRate: number; };
type LogType = "创建" | "结束";
type LogEntry = { time: string; operator: string; type: LogType; details: Record<string, string>; };

type Project = {
  id: string; name: string; description: string;
  startDate: string; endDate: string;
  createdBy: string; createdAt: string;
  employees: EmpRef[]; devices: DevRef[]; logs: LogEntry[];
};

type SystemFeeItem = { id: string; label: string; formula: string; amount: number; vouchers: string[]; };
type ManualFeeItem = { id: string; reason: string; amount: string; vouchers: string[]; };
type FeePanel = {
  id: string; label: string; hasSystem: boolean;
  systemItems: SystemFeeItem[]; manualItems: ManualFeeItem[]; expanded: boolean;
};

// ─── Constants ──────────────────────────────────────────────────────────────
const TODAY = "2026-03-01";
let _uid = 0;
const uid = () => `m${++_uid}_${Date.now()}`;

const FEE_CATEGORIES: { id: string; label: string; hasSystem: boolean }[] = [
  { id: "labor",      label: "人工费用",           hasSystem: true  },
  { id: "direct",     label: "直接投入费用",        hasSystem: false },
  { id: "deprec",     label: "折旧费用",            hasSystem: true  },
  { id: "intangible", label: "无形资产摊销",        hasSystem: false },
  { id: "design",     label: "设计试验费用",        hasSystem: false },
  { id: "outsource",  label: "外包合作费用",        hasSystem: false },
  { id: "ip",         label: "知识产权相关费用",    hasSystem: false },
  { id: "other",      label: "其他相关费用",        hasSystem: false },
];

const EMP_RATE: Record<string, number>  = { EMP001:72, EMP002:68, EMP003:45, EMP004:75, EMP005:80, EMP006:52, EMP007:38, EMP008:65 };
const EMP_COEFF: Record<string, number> = { EMP001:0.75, EMP002:0.72, EMP003:0.52, EMP004:0.78, EMP005:0.70, EMP006:0.58, EMP007:0.46, EMP008:0.68 };

// ─── Mock Data ──────────────────────────────────────────────────────────────
const mockProjects: Project[] = [
  {
    id:"p3", name:"AI 算法研发",
    description:"面向工业检测场景的深度学习算法研发，包含图像识别、缺陷检测和质量预测三个子模块。",
    startDate:"2026-02-10", endDate:"2026-02-28", createdBy:"陈静", createdAt:"2026-02-05 11:00",
    employees:[{employeeId:"EMP005",name:"陈静",type:"正式员工"},{employeeId:"EMP002",name:"李娜",type:"正式员工"}],
    devices:[{deviceId:"SM006",name:"打标机 F",depreciationRate:31}],
    logs:[
      {time:"2026-02-28 17:00",operator:"陈静",type:"结束",details:{结束时间:"2026-02-28"}},
      {time:"2026-02-05 11:00",operator:"陈静",type:"创建",details:{关联员工:"2 人",关联设备:"1 台"}},
    ],
  },
  {
    id:"p7", name:"移动端 App 重构",
    description:"将原生 App 迁移至 React Native 跨平台架构，同步完成 UI 设计系统升级。",
    startDate:"2026-01-20", endDate:"2026-02-25", createdBy:"李娜", createdAt:"2026-01-15 13:00",
    employees:[{employeeId:"EMP002",name:"李娜",type:"正式员工"},{employeeId:"EMP005",name:"陈静",type:"正式员工"},{employeeId:"EMP007",name:"孙丽",type:"外包人员"}],
    devices:[{deviceId:"SM004",name:"打包机 D",depreciationRate:22}],
    logs:[
      {time:"2026-02-25 16:00",operator:"李娜",type:"结束",details:{结束时间:"2026-02-25"}},
      {time:"2026-01-15 13:00",operator:"李娜",type:"创建",details:{关联员工:"2 人",关联设备:"1 台"}},
    ],
  },
  {
    id:"p10", name:"安全审计系统",
    description:"构建覆盖网络、应用、数据层的全栈安全审计平台，满足等保三级合规要求。",
    startDate:"2026-01-01", endDate:"2026-02-20", createdBy:"赵磊", createdAt:"2025-12-25 09:00",
    employees:[{employeeId:"EMP006",name:"赵磊",type:"兼职员工"},{employeeId:"EMP008",name:"周强",type:"正式员工"}],
    devices:[{deviceId:"SM006",name:"打标机 F",depreciationRate:31}],
    logs:[
      {time:"2026-02-20 17:00",operator:"赵磊",type:"结束",details:{结束时间:"2026-02-20"}},
      {time:"2025-12-25 09:00",operator:"赵磊",type:"创建",details:{关联员工:"2 人",关联设备:"1 台"}},
    ],
  },
  {
    id:"p14", name:"报表自动化",
    description:"打通各业务系统数据孤岛，实现财务、运营、销售等核心报表的全自动生成与分发。",
    startDate:"2026-02-05", endDate:"2026-02-28", createdBy:"李娜", createdAt:"2026-01-30 09:00",
    employees:[{employeeId:"EMP002",name:"李娜",type:"正式员工"},{employeeId:"EMP004",name:"刘洋",type:"正式员工"},{employeeId:"EMP008",name:"周强",type:"正式员工"}],
    devices:[{deviceId:"SM004",name:"打包机 D",depreciationRate:22},{deviceId:"SM005",name:"焊接机 E",depreciationRate:58}],
    logs:[
      {time:"2026-02-28 17:30",operator:"李娜",type:"结束",details:{结束时间:"2026-02-28"}},
      {time:"2026-01-30 09:00",operator:"李娜",type:"创建",details:{关联员工:"3 人",关联设备:"2 台"}},
    ],
  },
  {
    id:"p16", name:"云架构迁移",
    description:"将本地数据中心核心服务迁移至混合云架构，实现弹性扩缩容与多可用区容灾。",
    startDate:"2026-01-05", endDate:"2026-02-18", createdBy:"张伟", createdAt:"2025-12-28 10:00",
    employees:[{employeeId:"EMP001",name:"张伟",type:"正式员工"},{employeeId:"EMP003",name:"王芳",type:"兼职员工"},{employeeId:"EMP006",name:"赵磊",type:"兼职员工"},{employeeId:"EMP005",name:"陈静",type:"正式员工"}],
    devices:[{deviceId:"SM001",name:"冲压机 A",depreciationRate:45},{deviceId:"SM002",name:"缝纫机 B",depreciationRate:28}],
    logs:[
      {time:"2026-02-18 17:00",operator:"张伟",type:"结束",details:{结束时间:"2026-02-18"}},
      {time:"2025-12-28 10:00",operator:"张伟",type:"创建",details:{关联员工:"4 人",关联设备:"2 台"}},
    ],
  },
  {
    id:"p17", name:"微服务改造",
    description:"将单体应用拆分为 20+ 微服务，引入服务网格、分布式追踪和熔断限流等治理能力。",
    startDate:"2026-02-01", endDate:"2026-02-25", createdBy:"刘洋", createdAt:"2026-01-25 14:00",
    employees:[{employeeId:"EMP002",name:"李娜",type:"正式员工"},{employeeId:"EMP004",name:"刘洋",type:"正式员工"},{employeeId:"EMP007",name:"孙丽",type:"外包人员"}],
    devices:[{deviceId:"SM003",name:"裁断机 C",depreciationRate:36},{deviceId:"SM004",name:"打包机 D",depreciationRate:22}],
    logs:[
      {time:"2026-02-25 17:00",operator:"刘洋",type:"结束",details:{结束时间:"2026-02-25"}},
      {time:"2026-01-25 14:00",operator:"刘洋",type:"创建",details:{关联员工:"3 人",关联设备:"2 台"}},
    ],
  },
  {
    id:"p18", name:"前端组件库",
    description:"构建企业统一 UI 组件库，覆盖 60+ 基础组件，支持多主题切换与无障碍访问标准。",
    startDate:"2026-01-10", endDate:"2026-02-20", createdBy:"王芳", createdAt:"2026-01-05 09:00",
    employees:[{employeeId:"EMP003",name:"王芳",type:"兼职员工"},{employeeId:"EMP008",name:"周强",type:"正式员工"}],
    devices:[{deviceId:"SM005",name:"焊接机 E",depreciationRate:58}],
    logs:[
      {time:"2026-02-20 16:30",operator:"王芳",type:"结束",details:{结束时间:"2026-02-20"}},
      {time:"2026-01-05 09:00",operator:"王芳",type:"创建",details:{关联员工:"2 人",关联设备:"1 台"}},
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function getDays(start: string, end: string): number {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}
function calcHours(start: string, end: string): number {
  return Math.round(getDays(start, end) * 8 * 0.85);
}
function fmt(n: number): string {
  return n.toLocaleString("zh-CN") + " 元";
}
function panelSubtotal(p: FeePanel): number {
  return p.systemItems.reduce((s, i) => s + i.amount, 0) +
    p.manualItems.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
}
function overlaps(p: Project, s: string, e: string): boolean {
  if (!s && !e) return true;
  if (s && e) return p.startDate <= e && p.endDate >= s;
  if (s) return p.endDate >= s;
  return p.startDate <= e;
}

function initPanels(project: Project): FeePanel[] {
  const h = calcHours(project.startDate, project.endDate);
  const days = getDays(project.startDate, project.endDate);

  const laborItems: SystemFeeItem[] = project.employees.map(emp => {
    const rate  = EMP_RATE[emp.employeeId]  ?? 60;
    const coeff = EMP_COEFF[emp.employeeId] ?? 0.65;
    const amount = Math.round(h * rate * coeff);
    return { id: emp.employeeId, label: `${emp.name} (${emp.employeeId})`,
      formula: `${h}h × ¥${rate}/h × ${coeff}`, amount, vouchers: [] };
  });

  const deprecItems: SystemFeeItem[] = project.devices.map(dev => {
    const amount = Math.round(days * 8 * dev.depreciationRate);
    return { id: dev.deviceId, label: `${dev.name} (${dev.deviceId})`,
      formula: `${days}天 × 8h × ¥${dev.depreciationRate}/h`, amount, vouchers: [] };
  });

  return FEE_CATEGORIES.map(cat => ({
    id: cat.id, label: cat.label, hasSystem: cat.hasSystem, expanded: false,
    systemItems: cat.id === "labor" ? laborItems : cat.id === "deprec" ? deprecItems : [],
    manualItems: [],
  }));
}

// ─── Tiny shared UI ─────────────────────────────────────────────────────────
function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-[32px] h-[32px] rounded-[8px] bg-[#f4f4f4] flex items-center justify-center text-[#6f767e] hover:text-[#272b30] transition-colors">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
    </button>
  );
}

function VoucherUpload({ vouchers, onAdd }: { vouchers: string[]; onAdd: (n: string[]) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-[5px] flex-shrink-0">
      <input ref={ref} type="file" multiple className="hidden"
        onChange={e => { const n = Array.from(e.target.files ?? []).map(f => f.name); if (n.length) onAdd(n); e.target.value = ""; }} />
      <button onClick={() => ref.current?.click()}
        className={`flex items-center gap-[4px] px-[8px] h-[26px] rounded-[6px] text-[11px] font-semibold whitespace-nowrap transition-colors ${vouchers.length > 0 ? "bg-[#e6f9f0] text-[#0d9f5f]" : "bg-[#f4f4f4] text-[#6f767e] hover:bg-[#efefef]"}`}>
        <span>📎</span>
        {vouchers.length === 0 ? "上传凭证" : `已上传 ${vouchers.length} 个`}
      </button>
    </div>
  );
}

function Pagination({ total, page, onPage }: { total: number; page: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / 5));
  const btn = "w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[13px] font-semibold transition-colors";
  return (
    <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[#f4f4f4]">
      <p className="text-[#9a9fa5] text-[13px]">共 <span className="text-[#272b30] font-semibold">{total}</span> 个项目 · 第 {page}/{pages} 页</p>
      <div className="flex gap-[4px]">
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          className={`${btn} border border-[#efefef] bg-white text-[#6f767e] hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 10.5L5.5 7 9 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {Array.from({length: pages}, (_, i) => i + 1).map(p => (
          <button key={p} onClick={() => onPage(p)}
            className={`${btn} ${p === page ? "bg-[#272b30] text-white" : "border border-[#efefef] bg-white text-[#6f767e] hover:bg-[#f4f4f4]"}`}>{p}</button>
        ))}
        <button onClick={() => onPage(page + 1)} disabled={page >= pages}
          className={`${btn} border border-[#efefef] bg-white text-[#6f767e] hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3.5L8.5 7 5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

function ResourcePopover({ project, onClose }: { project: Project; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    setTimeout(() => document.addEventListener("mousedown", h), 0);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return (
    <div ref={ref} className="absolute left-0 top-[calc(100%+6px)] z-40 bg-white rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] p-[16px] w-[240px] border border-[#f4f4f4]">
      <div className="absolute top-[-5px] left-[20px] w-[10px] h-[10px] bg-white border-l border-t border-[#f4f4f4] rotate-45" />
      <p className="text-[#9a9fa5] text-[11px] font-semibold uppercase tracking-wider mb-[8px]">👥 关联员工 ({project.employees.length}人)</p>
      <div className="flex flex-wrap gap-[6px] mb-[10px]">
        {project.employees.map(e => <span key={e.employeeId} className="px-[8px] py-[3px] rounded-[6px] bg-[#f4f4f4] text-[#272b30] text-[12px] font-medium">{e.name}</span>)}
      </div>
      <div className="border-t border-[#f4f4f4] mb-[10px]" />
      <p className="text-[#9a9fa5] text-[11px] font-semibold uppercase tracking-wider mb-[8px]">💻 关联设备 ({project.devices.length}台)</p>
      <div className="flex flex-wrap gap-[6px]">
        {project.devices.map(d => <span key={d.deviceId} className="px-[8px] py-[3px] rounded-[6px] bg-[#f4f4f4] text-[#272b30] text-[12px] font-medium">{d.name}</span>)}
      </div>
    </div>
  );
}

// ─── Settlement Modal Sub-components ────────────────────────────────────────
function SystemItemRow({ item, onVoucher }: { item: SystemFeeItem; onVoucher: (n: string[]) => void }) {
  return (
    <div className="flex items-center gap-[10px] bg-[#f9fafb] rounded-[8px] px-[12px] py-[9px]">
      <span className="text-[#9a9fa5] text-[10px] font-semibold bg-[#efefef] px-[5px] py-[1px] rounded-[4px] flex-shrink-0">系统</span>
      <span className="text-[#272b30] text-[12px] font-semibold flex-shrink-0 min-w-[120px]">{item.label}</span>
      <span className="text-[#6f767e] text-[12px] flex-1">{item.formula} = <span className="text-[#272b30] font-semibold">{fmt(item.amount)}</span></span>
      <VoucherUpload vouchers={item.vouchers} onAdd={onVoucher} />
    </div>
  );
}

function ManualItemRow({ item, onUpdate, onRemove, onVoucher }: {
  item: ManualFeeItem;
  onUpdate: (f: "reason" | "amount", v: string) => void;
  onRemove: () => void;
  onVoucher: (n: string[]) => void;
}) {
  return (
    <div className="flex items-center gap-[8px] bg-white rounded-[8px] border border-[#efefef] px-[12px] py-[8px]">
      <input value={item.reason} onChange={e => onUpdate("reason", e.target.value)} placeholder="填写费用原因 / 说明"
        className="flex-1 min-w-0 text-[12px] text-[#272b30] bg-transparent outline-none placeholder-[#9a9fa5]" />
      <div className="flex items-center gap-[3px] flex-shrink-0">
        <span className="text-[#9a9fa5] text-[12px]">¥</span>
        <input type="number" value={item.amount} onChange={e => onUpdate("amount", e.target.value)} placeholder="0"
          className="w-[80px] text-[12px] text-[#272b30] bg-transparent outline-none text-right placeholder-[#9a9fa5]" />
      </div>
      <VoucherUpload vouchers={item.vouchers} onAdd={onVoucher} />
      <button onClick={onRemove} className="text-[#9a9fa5] hover:text-[#ff4d4f] transition-colors flex-shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

function FeeCategoryPanel({ panel, onToggle, onAdd, onRemoveManual, onUpdateManual, onSysVoucher, onManualVoucher }: {
  panel: FeePanel;
  onToggle: () => void;
  onAdd: () => void;
  onRemoveManual: (id: string) => void;
  onUpdateManual: (id: string, f: "reason" | "amount", v: string) => void;
  onSysVoucher: (itemId: string, names: string[]) => void;
  onManualVoucher: (itemId: string, names: string[]) => void;
}) {
  const sub = panelSubtotal(panel);
  return (
    <div className="border border-[#efefef] rounded-[12px] overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-[16px] py-[12px] bg-[#fafafa] hover:bg-[#f4f4f4] transition-colors">
        <div className="flex items-center gap-[8px]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform duration-150 ${panel.expanded ? "rotate-90" : ""}`}>
            <path d="M5 3l4 4-4 4" stroke="#9A9FA5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#272b30] text-[13px] font-semibold">{panel.label}</span>
          {(panel.systemItems.length > 0 || panel.manualItems.length > 0) && (
            <span className="text-[#9a9fa5] text-[11px]">{panel.systemItems.length + panel.manualItems.length} 项</span>
          )}
        </div>
        <span className={`text-[13px] font-semibold ${sub > 0 ? "text-[#272b30]" : "text-[#9a9fa5]"}`}>
          小计：{sub > 0 ? fmt(sub) : "—"}
        </span>
      </button>

      {panel.expanded && (
        <div className="px-[16px] py-[12px] flex flex-col gap-[6px]">
          {panel.systemItems.map(item => (
            <SystemItemRow key={item.id} item={item}
              onVoucher={n => onSysVoucher(item.id, n)} />
          ))}

          {panel.systemItems.length > 0 && panel.manualItems.length > 0 && (
            <div className="flex items-center gap-[8px] my-[2px]">
              <div className="flex-1 h-[1px] bg-[#f4f4f4]" />
              <span className="text-[#9a9fa5] text-[11px]">手动添加项</span>
              <div className="flex-1 h-[1px] bg-[#f4f4f4]" />
            </div>
          )}

          {panel.manualItems.map(item => (
            <ManualItemRow key={item.id} item={item}
              onUpdate={(f, v) => onUpdateManual(item.id, f, v)}
              onRemove={() => onRemoveManual(item.id)}
              onVoucher={n => onManualVoucher(item.id, n)} />
          ))}

          <button onClick={onAdd}
            className="flex items-center gap-[6px] text-[#3b5bdb] text-[12px] font-semibold hover:text-[#2a4bc7] transition-colors mt-[2px] w-fit">
            <span className="w-[18px] h-[18px] rounded-full border border-current flex items-center justify-center text-[13px] leading-none">+</span>
            添加{panel.label}项
          </button>
        </div>
      )}
    </div>
  );
}

function SettlementSummary({ panels }: { panels: FeePanel[] }) {
  const subs = panels.map(p => ({ label: p.label, amount: panelSubtotal(p) }));
  const total = subs.reduce((s, i) => s + i.amount, 0);
  return (
    <div className="bg-[#fafafa] rounded-[12px] p-[16px]">
      <div className="grid grid-cols-4 gap-[10px] mb-[14px]">
        {subs.map(s => (
          <div key={s.label} className="flex flex-col gap-[3px]">
            <span className="text-[#9a9fa5] text-[11px] leading-[15px]">{s.label}</span>
            <span className={`text-[13px] font-semibold ${s.amount > 0 ? "text-[#272b30]" : "text-[#d0d0d0]"}`}>
              {s.amount > 0 ? fmt(s.amount) : "—"}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-[#efefef] pt-[12px] flex items-center justify-between">
        <span className="text-[#6f767e] text-[13px] font-semibold">💰 结算总金额</span>
        <span className="text-[#0d9f5f] text-[22px] font-semibold">¥{total.toLocaleString("zh-CN")}</span>
      </div>
    </div>
  );
}

// ─── Submit Confirm Modal ────────────────────────────────────────────────────
function SubmitConfirmModal({ project, total, onConfirm, onCancel }: {
  project: Project; total: number; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.15)] w-[420px] p-[32px]">
        <div className="flex items-start gap-[14px] mb-[20px]">
          <div className="w-[44px] h-[44px] rounded-[12px] bg-[#e6f9f0] flex items-center justify-center flex-shrink-0">
            <span className="text-[22px]">💰</span>
          </div>
          <div>
            <h3 className="font-semibold text-[#272b30] text-[18px]">确认提交结算？</h3>
            <p className="text-[#6f767e] text-[13px] mt-[2px]">{project.name}</p>
          </div>
        </div>
        <div className="bg-[#fafafa] rounded-[10px] p-[14px] mb-[16px] flex flex-col gap-[8px]">
          {[
            { k:"项目周期", v:`${project.startDate} 至 ${project.endDate}` },
            { k:"关联员工", v:`${project.employees.length} 人` },
            { k:"关联设备", v:`${project.devices.length} 台` },
            { k:"结算总金额", v:<span className="text-[#0d9f5f] font-semibold text-[15px]">¥{total.toLocaleString("zh-CN")}</span> },
          ].map(r => (
            <div key={r.k} className="flex items-center justify-between">
              <span className="text-[#9a9fa5] text-[13px]">{r.k}</span>
              <span className="text-[#272b30] text-[13px] font-semibold">{r.v}</span>
            </div>
          ))}
        </div>
        <div className="bg-[#fff4e0] rounded-[10px] px-[12px] py-[9px] mb-[20px]">
          <p className="text-[#d48806] text-[12px]">⚠️ 提交后结算数据将固化存储，如需修改请联系管理员。</p>
        </div>
        <div className="flex gap-[12px]">
          <button onClick={onCancel} className="flex-1 h-[44px] rounded-[10px] border border-[#efefef] bg-white text-[#6f767e] text-[14px] font-semibold hover:bg-[#f4f4f4] transition-colors">取消</button>
          <button onClick={onConfirm} className="flex-1 h-[44px] rounded-[10px] bg-[#0d9f5f] text-white text-[14px] font-semibold hover:bg-[#0b8a52] transition-colors">确认提交</button>
        </div>
      </div>
    </div>
  );
}

// ─── Settlement Modal ────────────────────────────────────────────────────────
function SettlementModal({ project, onClose, onSubmit }: {
  project: Project; onClose: () => void; onSubmit: () => void;
}) {
  const [panels, setPanels] = useState<FeePanel[]>(() => initPanels(project));
  const [showConfirm, setShowConfirm] = useState(false);

  const updatePanel = (panelId: string, fn: (p: FeePanel) => FeePanel) =>
    setPanels(prev => prev.map(p => p.id === panelId ? fn(p) : p));

  const total = useMemo(() => panels.reduce((s, p) => s + panelSubtotal(p), 0), [panels]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[20px]">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] shadow-[0_16px_64px_rgba(0,0,0,0.18)] w-full max-w-[880px] h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-[28px] py-[20px] border-b border-[#f4f4f4] flex-shrink-0">
          <div>
            <div className="flex items-center gap-[8px]">
              <span className="text-[18px]">💰</span>
              <h3 className="font-semibold text-[#272b30] text-[18px]">项目结算</h3>
              <span className="text-[#9a9fa5] text-[14px]">— {project.name}</span>
            </div>
            <p className="text-[#9a9fa5] text-[12px] mt-[3px] pl-[26px]">{project.startDate} 至 {project.endDate}</p>
          </div>
          <CloseBtn onClick={onClose} />
        </div>

        {/* Body — two fixed sections, no outer scroll */}
        <div className="flex-1 min-h-0 px-[28px] py-[20px] flex flex-col gap-[16px]">

          {/* 费用明细 — 独立滚动区，防止面板叠压 */}
          <div className="flex flex-col min-h-0 flex-1">
            <p className="text-[#272b30] text-[13px] font-semibold flex items-center gap-[8px] mb-[10px] flex-shrink-0">
              <span className="w-[3px] h-[14px] rounded-full bg-[#272b30] block" />费用明细
              <span className="text-[#9a9fa5] text-[11px] font-normal ml-[4px]">点击展开各类费用</span>
            </p>
            <div className="overflow-y-auto flex flex-col gap-[6px] pr-[4px] flex-1">
              {panels.map(panel => (
                <FeeCategoryPanel
                  key={panel.id} panel={panel}
                  onToggle={() => updatePanel(panel.id, p => ({ ...p, expanded: !p.expanded }))}
                  onAdd={() => updatePanel(panel.id, p => ({
                    ...p, manualItems: [...p.manualItems, { id: uid(), reason: "", amount: "", vouchers: [] }]
                  }))}
                  onRemoveManual={itemId => updatePanel(panel.id, p => ({
                    ...p, manualItems: p.manualItems.filter(i => i.id !== itemId)
                  }))}
                  onUpdateManual={(itemId, f, v) => updatePanel(panel.id, p => ({
                    ...p, manualItems: p.manualItems.map(i => i.id === itemId ? { ...i, [f]: v } : i)
                  }))}
                  onSysVoucher={(itemId, names) => updatePanel(panel.id, p => ({
                    ...p, systemItems: p.systemItems.map(i => i.id === itemId ? { ...i, vouchers: [...i.vouchers, ...names] } : i)
                  }))}
                  onManualVoucher={(itemId, names) => updatePanel(panel.id, p => ({
                    ...p, manualItems: p.manualItems.map(i => i.id === itemId ? { ...i, vouchers: [...i.vouchers, ...names] } : i)
                  }))}
                />
              ))}
            </div>
          </div>

          {/* 结算总览 — 固定在下方 */}
          <div className="flex-shrink-0">
            <p className="text-[#272b30] text-[13px] font-semibold flex items-center gap-[8px] mb-[10px]">
              <span className="w-[3px] h-[14px] rounded-full bg-[#272b30] block" />结算总览
            </p>
            <SettlementSummary panels={panels} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-[28px] py-[18px] border-t border-[#f4f4f4] flex-shrink-0">
          <div className="flex items-center gap-[8px]">
            <span className="text-[#9a9fa5] text-[13px]">当前合计</span>
            <span className="text-[#0d9f5f] text-[18px] font-semibold">¥{total.toLocaleString("zh-CN")}</span>
          </div>
          <div className="flex gap-[12px]">
            <button onClick={onClose} className="h-[42px] px-[20px] rounded-[10px] border border-[#efefef] bg-white text-[#6f767e] text-[14px] font-semibold hover:bg-[#f4f4f4] transition-colors">取消</button>
            <button onClick={() => setShowConfirm(true)} className="h-[42px] px-[24px] rounded-[10px] bg-[#0d9f5f] text-white text-[14px] font-semibold hover:bg-[#0b8a52] transition-colors">提交结算</button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <SubmitConfirmModal project={project} total={total}
          onConfirm={onSubmit} onCancel={() => setShowConfirm(false)} />
      )}
    </div>
  );
}

// ─── Simple Detail Modal (reuses same design as ProjectListPage) ─────────────
function DetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [tab, setTab] = useState<"员工" | "设备">("员工");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-[24px]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-[20px] shadow-[0_16px_64px_rgba(0,0,0,0.16)] w-full max-w-[780px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-[32px] py-[22px] border-b border-[#f4f4f4] flex-shrink-0">
          <div className="flex items-center gap-[10px]">
            <span className="text-[20px]">🔍</span>
            <div><h3 className="font-semibold text-[#272b30] text-[18px]">项目详情</h3>
              <p className="text-[#9a9fa5] text-[13px]">{project.name}</p></div>
          </div>
          <CloseBtn onClick={onClose} />
        </div>
        <div className="overflow-y-auto flex-1 px-[32px] py-[22px] flex flex-col gap-[24px]">
          {/* Basic info */}
          <section>
            <p className="font-semibold text-[#272b30] text-[14px] mb-[12px] flex items-center gap-[8px]">
              <span className="w-[3px] h-[14px] rounded-full bg-[#272b30] block" />基本信息</p>
            <div className="grid grid-cols-2 gap-[10px]">
              {[
                {l:"项目名称",v:project.name},{l:"当前状态",v:<span className="inline-flex items-center gap-[5px] px-[10px] h-[24px] rounded-[6px] bg-[#fff4e0] text-[#d48806] text-[12px] font-semibold"><span className="w-[5px] h-[5px] rounded-full bg-[#d48806]"/>已结束</span>},
                {l:"开始时间",v:project.startDate},{l:"结束时间",v:project.endDate},
                {l:"创建时间",v:project.createdAt},{l:"创建人",v:project.createdBy},
              ].map((r,i) => (
                <div key={i} className="bg-[#fafafa] rounded-[10px] p-[12px]">
                  <p className="text-[#9a9fa5] text-[12px] mb-[3px]">{r.l}</p>
                  <p className="text-[#272b30] text-[13px] font-medium">{r.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-[10px] bg-[#fafafa] rounded-[10px] p-[12px]">
              <p className="text-[#9a9fa5] text-[12px] mb-[3px]">项目描述</p>
              <p className="text-[#272b30] text-[13px] leading-[20px]">{project.description}</p>
            </div>
          </section>
          {/* Resources */}
          <section>
            <div className="flex items-center justify-between mb-[12px]">
              <p className="font-semibold text-[#272b30] text-[14px] flex items-center gap-[8px]">
                <span className="w-[3px] h-[14px] rounded-full bg-[#272b30] block" />关联资源</p>
              <div className="flex gap-[6px]">
                {(["员工","设备"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-[14px] h-[32px] rounded-[8px] text-[12px] font-semibold transition-colors ${tab===t?"bg-[#272b30] text-white":"bg-[#f4f4f4] text-[#6f767e]"}`}>
                    {t === "员工" ? "👥 员工" : "💻 设备"}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[12px] border border-[#f4f4f4] overflow-hidden">
              <table className="w-full border-collapse">
                <thead><tr className="bg-[#f4f4f4]">
                  {tab === "员工"
                    ? ["序号","姓名","工号","员工类型","关联时间（项目创建时）"].map(h => <th key={h} className="text-left px-[14px] py-[10px] text-[#6f767e] text-[12px] font-semibold whitespace-nowrap">{h}</th>)
                    : ["序号","设备名称","设备编号","折旧单价"].map(h => <th key={h} className="text-left px-[14px] py-[10px] text-[#6f767e] text-[12px] font-semibold whitespace-nowrap">{h}</th>)
                  }
                </tr></thead>
                <tbody>
                  {tab === "员工"
                    ? project.employees.map((e,i) => (
                      <tr key={e.employeeId} className="border-t border-[#f4f4f4]">
                        <td className="px-[14px] py-[11px] text-[#9a9fa5] text-[13px]">{i+1}</td>
                        <td className="px-[14px] py-[11px] text-[#272b30] text-[13px] font-semibold">{e.name}</td>
                        <td className="px-[14px] py-[11px] text-[#6f767e] text-[13px] font-mono">{e.employeeId}</td>
                        <td className="px-[14px] py-[11px]"><span className="px-[7px] py-[2px] rounded-[5px] bg-[#f4f4f4] text-[#6f767e] text-[12px]">{e.type}</span></td>
                        <td className="px-[14px] py-[11px] text-[#9a9fa5] text-[12px]">{project.createdAt}</td>
                      </tr>
                    ))
                    : project.devices.map((d,i) => (
                      <tr key={d.deviceId} className="border-t border-[#f4f4f4]">
                        <td className="px-[14px] py-[11px] text-[#9a9fa5] text-[13px]">{i+1}</td>
                        <td className="px-[14px] py-[11px] text-[#272b30] text-[13px] font-semibold">{d.name}</td>
                        <td className="px-[14px] py-[11px] text-[#6f767e] text-[13px] font-mono">{d.deviceId}</td>
                        <td className="px-[14px] py-[11px] text-[#0d9f5f] text-[13px] font-semibold">¥{d.depreciationRate}/h</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </section>
          {/* Log */}
          <section>
            <p className="font-semibold text-[#272b30] text-[14px] mb-[14px] flex items-center gap-[8px]">
              <span className="w-[3px] h-[14px] rounded-full bg-[#272b30] block" />项目操作记录</p>
            {project.logs.map((log, i) => (
              <div key={i} className="flex gap-[12px]">
                <div className="flex flex-col items-center">
                  <div className="w-[30px] h-[30px] rounded-full bg-[#f4f4f4] flex items-center justify-center text-[14px] flex-shrink-0">
                    {log.type === "创建" ? "➕" : "⏹"}
                  </div>
                  {i < project.logs.length - 1 && <div className="w-[2px] flex-1 bg-[#f4f4f4] my-[5px] min-h-[16px]" />}
                </div>
                <div className={`flex-1 ${i < project.logs.length - 1 ? "pb-[14px]" : ""}`}>
                  <div className="flex items-center gap-[8px] mb-[6px]">
                    <span className="text-[#272b30] text-[13px] font-semibold">{log.time}</span>
                    <span className="text-[#9a9fa5] text-[12px]">·</span>
                    <div className="flex items-center gap-[5px]">
                      <div className="w-[17px] h-[17px] rounded-full bg-[#272b30] flex items-center justify-center text-white text-[10px]">{log.operator.slice(-1)}</div>
                      <span className="text-[#6f767e] text-[12px] font-semibold">{log.operator}</span>
                    </div>
                  </div>
                  <div className="bg-[#fafafa] rounded-[9px] p-[10px]">
                    <p className="text-[#272b30] text-[13px] font-semibold mb-[4px]">项目{log.type}</p>
                    {Object.entries(log.details).map(([k,v]) => (
                      <p key={k} className="text-[#6f767e] text-[12px]">• {k}：<span className="text-[#272b30]">{v}</span></p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
        <div className="px-[32px] py-[18px] border-t border-[#f4f4f4] flex-shrink-0">
          <button onClick={onClose} className="w-full h-[42px] rounded-[10px] border border-[#efefef] bg-white text-[#272b30] text-[14px] font-semibold hover:bg-[#f4f4f4] transition-colors">关闭</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main List View ──────────────────────────────────────────────────────────
function PendingSettlementMain() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  // Filters
  const [nameQ, setNameQ]       = useState("");
  const [dateS, setDateS]       = useState("");
  const [dateE, setDateE]       = useState("");
  const [activeF, setActiveF]   = useState({ name:"", dateS:"", dateE:"", queried:false });
  const [page, setPage]         = useState(1);

  // Modals
  const [settleProjId, setSettleProjId]   = useState<string|null>(null);
  const [detailProjId, setDetailProjId]   = useState<string|null>(null);
  const [resourceId, setResourceId]       = useState<string|null>(null);

  const filtered = useMemo(() => {
    const f = activeF;
    return projects.filter(p => {
      if (f.queried) {
        if (f.name && !p.name.includes(f.name)) return false;
        if (!overlaps(p, f.dateS, f.dateE)) return false;
      }
      return true;
    });
  }, [projects, activeF]);

  const paged = useMemo(() => filtered.slice((page-1)*5, page*5), [filtered, page]);

  const handleSettle = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setSettleProjId(null);
    setPage(1);
  };

  const settleProject = settleProjId ? projects.find(p => p.id === settleProjId) ?? null : null;
  const detailProject = detailProjId ? projects.find(p => p.id === detailProjId) ?? null : null;
  const resourceProj  = resourceId   ? projects.find(p => p.id === resourceId)   ?? null : null;

  return (
    <div className="flex flex-col gap-[20px]">
      {/* Filter Card */}
      <div className="bg-[#fcfcfc] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-[20px]">
        <div className="flex items-end gap-[12px] flex-wrap">
          <div className="flex flex-col gap-[5px]">
            <label className="text-[#6f767e] text-[12px] font-medium">项目名称</label>
            <input value={nameQ} onChange={e => setNameQ(e.target.value)} placeholder="搜索项目名称"
              className="h-[40px] px-[12px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] text-[#272b30] text-[13px] outline-none focus:border-[#272b30] transition-colors w-[180px]" />
          </div>
          <div className="flex flex-col gap-[5px]">
            <label className="text-[#6f767e] text-[12px] font-medium">时间范围</label>
            <div className="flex items-center gap-[8px]">
              <input type="date" value={dateS} max={dateE||TODAY} onChange={e => setDateS(e.target.value)}
                className="h-[40px] px-[10px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] text-[#272b30] text-[13px] outline-none focus:border-[#272b30] transition-colors" />
              <span className="text-[#9a9fa5] text-[12px]">至</span>
              <input type="date" value={dateE} min={dateS} max={TODAY} onChange={e => setDateE(e.target.value)}
                className="h-[40px] px-[10px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] text-[#272b30] text-[13px] outline-none focus:border-[#272b30] transition-colors" />
            </div>
          </div>
          <button onClick={() => { setActiveF({ name:nameQ, dateS, dateE, queried:true }); setPage(1); }}
            className="h-[40px] px-[18px] rounded-[10px] bg-[#272b30] text-white text-[13px] font-semibold hover:bg-[#1a1d1f] transition-colors">查询</button>
          {activeF.queried && (
            <button onClick={() => { setNameQ(""); setDateS(""); setDateE(""); setActiveF({ name:"",dateS:"",dateE:"",queried:false }); setPage(1); }}
              className="h-[40px] px-[14px] rounded-[10px] border border-[#efefef] bg-white text-[#6f767e] text-[13px] font-semibold hover:bg-[#f4f4f4] transition-colors">重置</button>
          )}
          <button onClick={() => {
            const rows = filtered.map((p,i) => `${i+1},${p.name},${p.startDate},${p.endDate},${p.createdBy},${p.employees.length}人,${p.devices.length}台`);
            const csv = ["序号,项目名称,开始时间,结束时间,创建人,员工,设备", ...rows].join("\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = "待结算项目.csv"; a.click();
          }} className="ml-auto flex items-center gap-[6px] h-[40px] px-[14px] rounded-[10px] border border-[#efefef] bg-white text-[#272b30] text-[13px] font-semibold hover:bg-[#f4f4f4] transition-colors">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10M5.333 6.667L8 9.333l2.667-2.666M8 9.333V2" stroke="#272B30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            导出 Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#fcfcfc] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f4f4f4]">
                {["序号","项目名称","开始时间","结束时间","创建人","关联资源","操作"].map(h => (
                  <th key={h} className="text-left px-[20px] py-[13px] text-[#6f767e] text-[12px] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((p, i) => (
                <tr key={p.id} className="border-b border-[#f4f4f4] last:border-0 hover:bg-[#fafafa] transition-colors">
                  <td className="px-[20px] py-[16px] text-[#9a9fa5] text-[13px] w-[56px]">{(page-1)*5+i+1}</td>
                  <td className="px-[20px] py-[16px] text-[#272b30] text-[13px] font-semibold">{p.name}</td>
                  <td className="px-[20px] py-[16px] text-[#6f767e] text-[13px] whitespace-nowrap">{p.startDate}</td>
                  <td className="px-[20px] py-[16px] text-[#6f767e] text-[13px] whitespace-nowrap">{p.endDate}</td>
                  <td className="px-[20px] py-[16px] text-[#6f767e] text-[13px]">{p.createdBy}</td>
                  <td className="px-[20px] py-[16px]">
                    <div className="relative">
                      <button onClick={() => setResourceId(prev => prev === p.id ? null : p.id)}
                        className="flex items-center gap-[5px] px-[10px] h-[28px] rounded-[7px] border border-[#efefef] bg-white text-[12px] font-semibold hover:bg-[#f4f4f4] transition-colors whitespace-nowrap">
                        <span className="text-[#6f767e]">{p.employees.length}人</span>
                        <span className="text-[#efefef]">/</span>
                        <span className="text-[#6f767e]">{p.devices.length}设备</span>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="#9A9FA5" strokeWidth="1.4" strokeLinecap="round"/></svg>
                      </button>
                      {resourceId === p.id && <ResourcePopover project={p} onClose={() => setResourceId(null)} />}
                    </div>
                  </td>
                  <td className="px-[20px] py-[16px]">
                    <div className="flex gap-[8px]">
                      <button onClick={() => setSettleProjId(p.id)}
                        className="px-[10px] h-[30px] rounded-[8px] border border-[#0d9f5f]/30 bg-[#e6f9f0] text-[#0d9f5f] text-[12px] font-semibold hover:bg-[#c8f0dd] transition-colors">结算</button>
                      <button onClick={() => setDetailProjId(p.id)}
                        className="px-[10px] h-[30px] rounded-[8px] border border-[#efefef] bg-white text-[#272b30] text-[12px] font-semibold hover:bg-[#f4f4f4] transition-colors">详情</button>
                    </div>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="py-[56px] text-center text-[#9a9fa5] text-[14px]">暂无待结算项目</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} onPage={setPage} />
      </div>

      {settleProject && <SettlementModal project={settleProject} onClose={() => setSettleProjId(null)} onSubmit={() => handleSettle(settleProject.id)} />}
      {detailProject && <DetailModal project={detailProject} onClose={() => setDetailProjId(null)} />}
    </div>
  );
}

// ─── Showcase ────────────────────────────────────────────────────────────────
function PendingSettlementShowcase() {
  const demoProject = mockProjects[0]; // AI算法研发
  const mockPanels = initPanels(demoProject);
  // Pre-fill some manual items for demo
  const panels: FeePanel[] = mockPanels.map(p => {
    if (p.id === "labor") return { ...p, manualItems: [
      { id: "m1", reason: "五险一金（2月）", amount: "2800", vouchers: ["社保缴纳凭证.pdf"] },
    ]};
    if (p.id === "outsource") return { ...p, manualItems: [
      { id: "m2", reason: "第三方测试费", amount: "8000", vouchers: ["测试报告.pdf","合同扫描件.pdf"] },
    ]};
    return p;
  });
  const total = panels.reduce((s, p) => s + panelSubtotal(p), 0);

  function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
    return (
      <section>
        <div className="flex items-center gap-[12px] mb-[20px]">
          <div className="w-[28px] h-[28px] rounded-[8px] bg-[#272b30] flex items-center justify-center text-white text-[13px] font-semibold">{num}</div>
          <h3 className="font-semibold text-[18px] text-[#272b30]">{title}</h3>
        </div>
        {children}
      </section>
    );
  }

  return (
    <div className="bg-[#e8e8e8] min-h-screen p-[48px]">
      <h2 className="font-semibold text-[24px] text-[#272b30] mb-[4px]">待结算项目 — 弹窗设计稿</h2>
      <p className="text-[#6f767e] text-[13px] mb-[48px]">所有交互弹窗静态展示，可直接框选复制到 Figma</p>

      <div className="flex flex-col gap-[56px]">

        {/* 1. 结算弹窗主体 */}
        <Section num={1} title="���目结算弹窗（费用明细 + 结算总览）">
          <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[880px] max-h-[640px] flex flex-col">
            <div className="flex items-center justify-between px-[28px] py-[20px] border-b border-[#f4f4f4] flex-shrink-0">
              <div>
                <div className="flex items-center gap-[8px]"><span className="text-[18px]">💰</span>
                  <h3 className="font-semibold text-[#272b30] text-[18px]">项目结算</h3>
                  <span className="text-[#9a9fa5] text-[14px]">— {demoProject.name}</span></div>
                <p className="text-[#9a9fa5] text-[12px] mt-[3px] pl-[26px]">{demoProject.startDate} 至 {demoProject.endDate}</p>
              </div>
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#f4f4f4] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="#6F767E" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
            </div>
            <div className="overflow-y-auto flex-1 px-[28px] py-[20px] flex flex-col gap-[8px]">
              <p className="text-[#272b30] text-[13px] font-semibold flex items-center gap-[8px] mb-[2px]">
                <span className="w-[3px] h-[14px] rounded-full bg-[#272b30] block" />费用明细</p>
              {panels.slice(0,4).map(panel => (
                <div key={panel.id} className="border border-[#efefef] rounded-[12px] overflow-hidden">
                  <div className="flex items-center justify-between px-[16px] py-[11px] bg-[#fafafa]">
                    <div className="flex items-center gap-[8px]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="rotate-90">
                        <path d="M5 3l4 4-4 4" stroke="#9A9FA5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[#272b30] text-[13px] font-semibold">{panel.label}</span>
                    </div>
                    <span className={`text-[13px] font-semibold ${panelSubtotal(panel)>0?"text-[#272b30]":"text-[#9a9fa5]"}`}>
                      小计：{panelSubtotal(panel)>0 ? fmt(panelSubtotal(panel)) : "—"}
                    </span>
                  </div>
                  {panel.expanded && (panel.systemItems.length > 0 || panel.manualItems.length > 0) && (
                    <div className="px-[16px] py-[10px] flex flex-col gap-[6px]">
                      {panel.systemItems.map(item => (
                        <div key={item.id} className="flex items-center gap-[10px] bg-[#f9fafb] rounded-[8px] px-[12px] py-[8px]">
                          <span className="text-[#9a9fa5] text-[10px] font-semibold bg-[#efefef] px-[5px] py-[1px] rounded-[4px]">系统</span>
                          <span className="text-[#272b30] text-[12px] font-semibold min-w-[120px]">{item.label}</span>
                          <span className="text-[#6f767e] text-[12px] flex-1">{item.formula} = <span className="text-[#272b30] font-semibold">{fmt(item.amount)}</span></span>
                          <span className="px-[8px] h-[24px] rounded-[6px] bg-[#e6f9f0] text-[#0d9f5f] text-[11px] font-semibold flex items-center gap-[3px]">📎 已上传 1 个</span>
                        </div>
                      ))}
                      {panel.systemItems.length > 0 && panel.manualItems.length > 0 && (
                        <div className="flex items-center gap-[8px] my-[2px]">
                          <div className="flex-1 h-[1px] bg-[#f4f4f4]"/><span className="text-[#9a9fa5] text-[11px]">手动添加项</span><div className="flex-1 h-[1px] bg-[#f4f4f4]"/>
                        </div>
                      )}
                      {panel.manualItems.map(item => (
                        <div key={item.id} className="flex items-center gap-[8px] bg-white rounded-[8px] border border-[#efefef] px-[12px] py-[8px]">
                          <span className="flex-1 text-[12px] text-[#272b30]">{item.reason}</span>
                          <span className="text-[#272b30] text-[12px] font-semibold flex-shrink-0">¥{Number(item.amount).toLocaleString("zh-CN")}</span>
                          <span className="px-[8px] h-[24px] rounded-[6px] bg-[#e6f9f0] text-[#0d9f5f] text-[11px] font-semibold flex items-center gap-[3px] flex-shrink-0">📎 已上传 {item.vouchers.length} 个</span>
                          <div className="w-[20px] h-[20px] rounded-[5px] bg-[#fff2f0] text-[#ff4d4f] flex items-center justify-center flex-shrink-0">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M7.5 2.5l-5 5M2.5 2.5l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* 显示剩余折叠的面板 */}
              {panels.slice(4).map(panel => (
                <div key={panel.id} className="border border-[#efefef] rounded-[12px]">
                  <div className="flex items-center justify-between px-[16px] py-[11px] bg-[#fafafa]">
                    <div className="flex items-center gap-[8px]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3l4 4-4 4" stroke="#9A9FA5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[#272b30] text-[13px] font-semibold">{panel.label}</span>
                    </div>
                    <span className="text-[#9a9fa5] text-[13px] font-semibold">小计：—</span>
                  </div>
                </div>
              ))}
              <div className="mt-[4px]">
                <p className="text-[#272b30] text-[13px] font-semibold flex items-center gap-[8px] mb-[10px]">
                  <span className="w-[3px] h-[14px] rounded-full bg-[#272b30] block" />结算总览</p>
                <div className="bg-[#fafafa] rounded-[12px] p-[16px]">
                  <div className="grid grid-cols-4 gap-[10px] mb-[14px]">
                    {panels.map(p => ({ label: p.label, amount: panelSubtotal(p) })).map(s => (
                      <div key={s.label} className="flex flex-col gap-[3px]">
                        <span className="text-[#9a9fa5] text-[11px] leading-[15px]">{s.label}</span>
                        <span className={`text-[13px] font-semibold ${s.amount > 0 ? "text-[#272b30]" : "text-[#d0d0d0]"}`}>
                          {s.amount > 0 ? fmt(s.amount) : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#efefef] pt-[12px] flex items-center justify-between">
                    <span className="text-[#6f767e] text-[13px] font-semibold">💰 结算总金额</span>
                    <span className="text-[#0d9f5f] text-[22px] font-semibold">¥{total.toLocaleString("zh-CN")}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-[28px] py-[18px] border-t border-[#f4f4f4] flex-shrink-0">
              <div className="flex items-center gap-[8px]">
                <span className="text-[#9a9fa5] text-[13px]">当前合计</span>
                <span className="text-[#0d9f5f] text-[18px] font-semibold">¥{total.toLocaleString("zh-CN")}</span>
              </div>
              <div className="flex gap-[12px]">
                <div className="h-[42px] px-[20px] rounded-[10px] border border-[#efefef] bg-white flex items-center text-[#6f767e] text-[14px] font-semibold">取消</div>
                <div className="h-[42px] px-[24px] rounded-[10px] bg-[#0d9f5f] flex items-center text-white text-[14px] font-semibold">提交结算</div>
              </div>
            </div>
          </div>
        </Section>

        {/* 2. 提交确认弹窗 */}
        <Section num={2} title="提交结算二次确认弹窗">
          <div className="bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.12)] w-[420px] p-[32px]">
            <div className="flex items-start gap-[14px] mb-[20px]">
              <div className="w-[44px] h-[44px] rounded-[12px] bg-[#e6f9f0] flex items-center justify-center flex-shrink-0">
                <span className="text-[22px]">💰</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#272b30] text-[18px]">确认提交结算？</h3>
                <p className="text-[#6f767e] text-[13px] mt-[2px]">{demoProject.name}</p>
              </div>
            </div>
            <div className="bg-[#fafafa] rounded-[10px] p-[14px] mb-[16px] flex flex-col gap-[8px]">
              {[
                {k:"项目周期",v:`${demoProject.startDate} 至 ${demoProject.endDate}`},
                {k:"关联员工",v:`${demoProject.employees.length} 人`},
                {k:"关联设备",v:`${demoProject.devices.length} 台`},
                {k:"结算总金额",v:<span className="text-[#0d9f5f] font-semibold text-[15px]">¥{total.toLocaleString("zh-CN")}</span>},
              ].map(r => (
                <div key={r.k} className="flex items-center justify-between">
                  <span className="text-[#9a9fa5] text-[13px]">{r.k}</span>
                  <span className="text-[#272b30] text-[13px] font-semibold">{r.v}</span>
                </div>
              ))}
            </div>
            <div className="bg-[#fff4e0] rounded-[10px] px-[12px] py-[9px] mb-[20px]">
              <p className="text-[#d48806] text-[12px]">⚠️ 提交后结算数据将固化存储，如需修改请联系管理员。</p>
            </div>
            <div className="flex gap-[12px]">
              <div className="flex-1 h-[44px] rounded-[10px] border border-[#efefef] bg-white flex items-center justify-center text-[#6f767e] text-[14px] font-semibold">取消</div>
              <div className="flex-1 h-[44px] rounded-[10px] bg-[#0d9f5f] flex items-center justify-center text-white text-[14px] font-semibold">确认提交</div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}

// ─── Page Export ─────────────────────────────────────────────────────────────
export function PendingSettlementPage() {
  const [view, setView] = useState<"list"|"showcase">("list");
  return (
    <div className="px-[40px] py-[40px]">
      <div className="flex items-center justify-between mb-[28px]">
        <h1 className="font-semibold text-[32px] text-[#272b30] leading-[40px] tracking-[-0.6px]">待结算项目</h1>
        <div className="flex gap-[4px] bg-[#efefef] rounded-[10px] p-[4px]">
          <button onClick={() => setView("list")}
            className={`px-[14px] h-[32px] rounded-[8px] text-[13px] font-semibold transition-colors ${view==="list"?"bg-white text-[#272b30] shadow-[0_1px_3px_rgba(0,0,0,0.08)]":"text-[#6f767e] hover:text-[#272b30]"}`}>功能视图</button>
          <button onClick={() => setView("showcase")}
            className={`px-[14px] h-[32px] rounded-[8px] text-[13px] font-semibold transition-colors ${view==="showcase"?"bg-white text-[#272b30] shadow-[0_1px_3px_rgba(0,0,0,0.08)]":"text-[#6f767e] hover:text-[#272b30]"}`}>弹窗设计稿</button>
        </div>
      </div>
      {view === "list" ? <PendingSettlementMain /> : <PendingSettlementShowcase />}
    </div>
  );
}
