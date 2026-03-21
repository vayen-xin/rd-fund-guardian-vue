import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type LogRecord = {
  id: string;
  time: string;      // "YYYY-MM-DD HH:mm:ss"
  operator: string;
  content: string;
};

// ─── Mock Data Generator ──────────────────────────────────────────────────────
const MOCK_OPERATORS = ["admin", "张伟", "李娜", "王芳", "刘洋", "陈静"];

const MOCK_OPERATIONS = [
  "添加了员工「陈静」",
  "修改了员工「李娜」的职位为「高级技师」",
  "删除了员工「赵磊」",
  "批量导入了 8 名员工信息",
  "手动添加了打卡记录「张伟 · 2026-02-28」",
  "修改了打卡记录「王芳 · 2026-03-01」，数据来源变更为手动录入",
  "删除了打卡记录「刘洋 · 2026-03-05」",
  "导入了 15 条打卡记录",
  "导入了 23 条打卡记录",
  "修改了设备「SM001 冲压机」的折旧单价为 ¥45.00/h",
  "启用了设备「SM003 裁断机」",
  "停用了设备「SM002 缝纫机」",
  "添加了设备「SM006 打标机」",
  "修改了设备「SM004 打包机」的备注信息",
  "添加了项目「2026 年 Q1 智能制造项目」",
  "修改了项目「2025 年包装项目」的状态",
  "添加了账号「孙丽」，权限设为操作员",
  "重置了账号「李娜」的登录密码",
  "停用了账号「周强」",
  "修改了账号「operator01」的角色权限",
  "导出了操作日志记录（共 240 条）",
  "修改了员工「刘洋」的入职时间",
  "修改了员工「孙丽」的员工类型为「外包人员」",
  "添加了员工「周强」",
  "导入了 30 条打卡记录",
];

function pad2(n: number) { return String(n).padStart(2, "0"); }
function formatTime(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
function dateOf(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function generateLogs(): LogRecord[] {
  const logs: LogRecord[] = [];
  // Start from 2026-03-01 17:45:00, walk backwards
  let cur = new Date("2026-03-01T17:45:00");
  // Pseudo-random intervals to look natural
  const intervals = [3, 8, 1, 14, 5, 2, 20, 7, 11, 4, 6, 15, 3, 9, 2, 18, 1, 13, 7, 4, 12, 6, 3, 19, 8];
  for (let i = 0; i < 285; i++) {
    logs.push({
      id: `log-${i + 1}`,
      time: formatTime(cur),
      operator: MOCK_OPERATORS[i % MOCK_OPERATORS.length],
      content: MOCK_OPERATIONS[i % MOCK_OPERATIONS.length],
    });
    const hrs = intervals[i % intervals.length];
    const mins = (i * 17 + 3) % 60;
    cur = new Date(cur.getTime() - (hrs * 60 + mins) * 60 * 1000);
  }
  return logs;
}

const ALL_LOGS = generateLogs();

const PAGE_SIZE_PRESETS = [10, 20, 50, 100];

// ─── Pagination Component ─────────────────────────────────────────────────────
function Pagination({
  total, page, pageSize, onPage, onPageSize,
}: {
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [customMode, setCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const isPreset = PAGE_SIZE_PRESETS.includes(pageSize);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === "custom") {
      setCustomMode(true);
      setCustomInput(String(pageSize));
    } else {
      setCustomMode(false);
      onPageSize(Number(v));
      onPage(1);
    }
  };

  const applyCustom = () => {
    const n = parseInt(customInput, 10);
    if (n >= 1 && n <= 500) {
      onPageSize(n);
      onPage(1);
    }
    setCustomMode(false);
  };

  // Build page number list
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    const around = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages].filter(x => x >= 1 && x <= totalPages));
    const sorted = Array.from(around).sort((a, b) => a - b);
    let prev: number | null = null;
    for (const p of sorted) {
      if (prev !== null && p - prev > 1) pages.push("...");
      pages.push(p);
      prev = p;
    }
  }

  const btnBase = "w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[13px] font-semibold transition-colors";

  return (
    <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[#f4f4f4] flex-wrap gap-[12px]">
      {/* Left: page buttons */}
      <div className="flex items-center gap-[4px]">
        <button
          onClick={() => onPage(1)} disabled={page === 1}
          className={`${btnBase} border border-[#efefef] bg-white text-[#6f767e] hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed`}
          title="首页"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 10.5L5.5 7 9 3.5M5 10.5V3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => onPage(page - 1)} disabled={page === 1}
          className={`${btnBase} border border-[#efefef] bg-white text-[#6f767e] hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 10.5L5.5 7 9 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dot-${i}`} className="w-[32px] flex justify-center items-center text-[#9a9fa5] text-[13px] select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`${btnBase} ${p === page ? "bg-[#272b30] text-white" : "border border-[#efefef] bg-white text-[#6f767e] hover:bg-[#f4f4f4]"}`}
            >{p}</button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)} disabled={page >= totalPages}
          className={`${btnBase} border border-[#efefef] bg-white text-[#6f767e] hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3.5L8.5 7 5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => onPage(totalPages)} disabled={page >= totalPages}
          className={`${btnBase} border border-[#efefef] bg-white text-[#6f767e] hover:bg-[#f4f4f4] disabled:opacity-40 disabled:cursor-not-allowed`}
          title="末页"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3.5L8.5 7 5 10.5M9 3.5V10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Right: total + page size */}
      <div className="flex items-center gap-[12px]">
        <span className="text-[#9a9fa5] text-[13px]">共 <span className="text-[#272b30] font-semibold">{total}</span> 条</span>
        <div className="w-[1px] h-[16px] bg-[#efefef]" />
        <div className="flex items-center gap-[6px]">
          <span className="text-[#9a9fa5] text-[13px] whitespace-nowrap">每页</span>
          {customMode ? (
            <input
              type="number"
              min={1}
              max={500}
              value={customInput}
              autoFocus
              onChange={(e) => setCustomInput(e.target.value)}
              onBlur={applyCustom}
              onKeyDown={(e) => e.key === "Enter" && applyCustom()}
              className="w-[64px] h-[30px] px-[8px] rounded-[8px] border border-[#272b30] bg-white text-[#272b30] text-[13px] text-center outline-none"
            />
          ) : (
            <div className="relative">
              <select
                value={isPreset ? pageSize : "custom"}
                onChange={handleSelectChange}
                className="h-[30px] pl-[10px] pr-[28px] rounded-[8px] border border-[#efefef] bg-white text-[#272b30] text-[13px] font-semibold outline-none appearance-none cursor-pointer hover:border-[#272b30] transition-colors"
              >
                {PAGE_SIZE_PRESETS.map(n => <option key={n} value={n}>{n}</option>)}
                {!isPreset && <option value={pageSize}>{pageSize}</option>}
                <option value="custom">自定义</option>
              </select>
              <svg className="absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5l3 3 3-3" stroke="#9A9FA5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
          <span className="text-[#9a9fa5] text-[13px]">条</span>
        </div>
        <div className="w-[1px] h-[16px] bg-[#efefef]" />
        <span className="text-[#9a9fa5] text-[13px]">第 <span className="text-[#272b30] font-semibold">{page}</span> / {totalPages} 页</span>
      </div>
    </div>
  );
}

// ─── Main Functional View ─────────────────────────────────────────────────────
function OperationLogMain() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [operatorInput, setOperatorInput] = useState("");

  const [activeStart, setActiveStart] = useState("");
  const [activeEnd, setActiveEnd] = useState("");
  const [activeOperator, setActiveOperator] = useState("");
  const [hasQueried, setHasQueried] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [exportAnim, setExportAnim] = useState(false);

  const filteredLogs = useMemo(() => {
    if (!hasQueried) return ALL_LOGS;
    return ALL_LOGS.filter((r) => {
      const rDate = r.time.slice(0, 10);
      const matchStart = !activeStart || rDate >= activeStart;
      const matchEnd = !activeEnd || rDate <= activeEnd;
      const matchOp = !activeOperator || r.operator.includes(activeOperator);
      return matchStart && matchEnd && matchOp;
    });
  }, [hasQueried, activeStart, activeEnd, activeOperator]);

  const pagedLogs = useMemo(() => {
    const s = (page - 1) * pageSize;
    return filteredLogs.slice(s, s + pageSize);
  }, [filteredLogs, page, pageSize]);

  const handleQuery = () => {
    setActiveStart(startDate);
    setActiveEnd(endDate);
    setActiveOperator(operatorInput);
    setHasQueried(true);
    setPage(1);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setOperatorInput("");
    setActiveStart("");
    setActiveEnd("");
    setActiveOperator("");
    setHasQueried(false);
    setPage(1);
  };

  const handleExport = () => {
    setExportAnim(true);
    setTimeout(() => setExportAnim(false), 1500);
    // In real implementation: download CSV/Excel
    const csv = ["序号,操作时间,操作人,操作内容",
      ...filteredLogs.map((r, i) => `${i + 1},${r.time},${r.operator},"${r.content}"`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "操作日志.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-[24px]">
      {/* ── 筛选区 ── */}
      <div className="bg-[#fcfcfc] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-[24px]">
        <div className="flex items-end justify-between flex-wrap gap-[12px]">
          {/* Left filters */}
          <div className="flex items-end gap-[12px] flex-wrap">
            {/* 时间范围 */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[#6f767e] text-[12px] font-medium">时间范围</label>
              <div className="flex items-center gap-[8px]">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-[40px] px-[12px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] text-[#272b30] text-[13px] outline-none focus:border-[#272b30] transition-colors"
                />
                <span className="text-[#9a9fa5] text-[12px] select-none">至</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-[40px] px-[12px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] text-[#272b30] text-[13px] outline-none focus:border-[#272b30] transition-colors"
                />
              </div>
            </div>

            {/* 操作人 */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[#6f767e] text-[12px] font-medium">操作人</label>
              <input
                type="text"
                placeholder="请输入操作人姓名"
                value={operatorInput}
                onChange={(e) => setOperatorInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                className="h-[40px] px-[12px] w-[160px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] text-[#272b30] text-[13px] outline-none focus:border-[#272b30] transition-colors"
              />
            </div>

            {/* 查询 / 重置 */}
            <button
              onClick={handleQuery}
              className="h-[40px] px-[18px] rounded-[10px] bg-[#272b30] text-white text-[13px] font-semibold hover:bg-[#1a1d1f] transition-colors"
            >查询</button>
            {(hasQueried || startDate || endDate || operatorInput) && (
              <button
                onClick={handleReset}
                className="h-[40px] px-[14px] rounded-[10px] border border-[#efefef] bg-white text-[#6f767e] text-[13px] font-semibold hover:bg-[#f4f4f4] transition-colors"
              >重置</button>
            )}
          </div>

          {/* Right: Export */}
          <button
            onClick={handleExport}
            className={`flex items-center gap-[7px] h-[40px] px-[16px] rounded-[10px] border transition-colors text-[13px] font-semibold ${
              exportAnim
                ? "border-[#0d9f5f]/30 bg-[#e6f9f0] text-[#0d9f5f]"
                : "border-[#efefef] bg-white text-[#272b30] hover:bg-[#f4f4f4]"
            }`}
          >
            {exportAnim ? (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M2.5 10l3.5 3.5 6.5-7" stroke="#0d9f5f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                已导出
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10M5.333 6.667L8 9.333l2.667-2.666M8 9.333V2" stroke="#272B30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                导出日志
              </>
            )}
          </button>
        </div>

        {/* Active filter badges */}
        {hasQueried && (activeStart || activeEnd || activeOperator) && (
          <div className="flex items-center gap-[8px] mt-[14px] pt-[14px] border-t border-[#f4f4f4] flex-wrap">
            <span className="text-[#9a9fa5] text-[12px]">当前筛选：</span>
            {(activeStart || activeEnd) && (
              <span className="px-[10px] h-[24px] rounded-[6px] bg-[#f4f4f4] text-[#272b30] text-[12px] font-medium flex items-center gap-[4px]">
                📅 {activeStart || "—"} 至 {activeEnd || "—"}
              </span>
            )}
            {activeOperator && (
              <span className="px-[10px] h-[24px] rounded-[6px] bg-[#f4f4f4] text-[#272b30] text-[12px] font-medium flex items-center gap-[4px]">
                👤 {activeOperator}
              </span>
            )}
            <span className="text-[#9a9fa5] text-[12px]">共 <span className="text-[#272b30] font-semibold">{filteredLogs.length}</span> 条结果</span>
          </div>
        )}
      </div>

      {/* ── 日志表格 ── */}
      <div className="bg-[#fcfcfc] rounded-[16px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#f4f4f4]">
                {[
                  { label: "序号", w: "w-[72px]" },
                  { label: "操作时间", w: "w-[180px]" },
                  { label: "操作人", w: "w-[100px]" },
                  { label: "操作内容", w: "" },
                ].map(({ label, w }) => (
                  <th key={label} className={`text-left px-[20px] py-[13px] text-[#6f767e] text-[12px] font-semibold whitespace-nowrap ${w}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedLogs.map((r, i) => {
                const globalIdx = (page - 1) * pageSize + i + 1;
                return (
                  <tr key={r.id} className="border-b border-[#f4f4f4] last:border-b-0 hover:bg-[#fafafa] transition-colors">
                    <td className="px-[20px] py-[14px] text-[#9a9fa5] text-[13px] whitespace-nowrap">
                      {globalIdx}
                    </td>
                    <td className="px-[20px] py-[14px] whitespace-nowrap">
                      <div className="flex flex-col gap-[1px]">
                        <span className="text-[#272b30] text-[13px] font-medium">{r.time.slice(0, 10)}</span>
                        <span className="text-[#9a9fa5] text-[12px]">{r.time.slice(11)}</span>
                      </div>
                    </td>
                    <td className="px-[20px] py-[14px] whitespace-nowrap">
                      <div className="flex items-center gap-[7px]">
                        <div className="w-[26px] h-[26px] rounded-full bg-[#272b30] flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0">
                          {r.operator.slice(-1)}
                        </div>
                        <span className="text-[#272b30] text-[13px] font-semibold">{r.operator}</span>
                      </div>
                    </td>
                    <td className="px-[20px] py-[14px]">
                      <span className="text-[#272b30] text-[13px] leading-[20px]">{r.content}</span>
                    </td>
                  </tr>
                );
              })}
              {pagedLogs.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-[56px] text-[#9a9fa5] text-[14px]">
                    暂无符合条件的操作日志
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          total={filteredLogs.length}
          page={page}
          pageSize={pageSize}
          onPage={setPage}
          onPageSize={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>
    </div>
  );
}

// ─── Showcase View ────────────────────────────────────────────────────────────
function OperationLogShowcase() {
  return (
    <div className="bg-[#e8e8e8] min-h-screen p-[48px]">
      <h2 className="font-semibold text-[24px] text-[#272b30] mb-[4px]">操作日志 — 页面设计稿</h2>
      <p className="text-[#6f767e] text-[13px] mb-[40px]">此模块无交互弹窗，以下展示各区块设计组件，可直接框选复制到 Figma</p>

      <div className="flex flex-col gap-[48px]">

        {/* Section 1: 筛选区 */}
        <div>
          <div className="flex items-center gap-[12px] mb-[20px]">
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[#272b30] flex items-center justify-center text-white text-[13px] font-semibold">1</div>
            <h3 className="font-semibold text-[18px] text-[#272b30]">筛选区（空状态）</h3>
          </div>
          <div className="bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-[24px] w-fit">
            <div className="flex items-end gap-[12px] flex-wrap">
              <div className="flex flex-col gap-[6px]">
                <div className="text-[#6f767e] text-[12px] font-medium">时间范围</div>
                <div className="flex items-center gap-[8px]">
                  <div className="h-[40px] px-[12px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] flex items-center text-[#9a9fa5] text-[13px] w-[140px]">开始日期</div>
                  <span className="text-[#9a9fa5] text-[12px]">至</span>
                  <div className="h-[40px] px-[12px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] flex items-center text-[#9a9fa5] text-[13px] w-[140px]">结束日期</div>
                </div>
              </div>
              <div className="flex flex-col gap-[6px]">
                <div className="text-[#6f767e] text-[12px] font-medium">操作人</div>
                <div className="h-[40px] px-[12px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] flex items-center text-[#9a9fa5] text-[13px] w-[160px]">请输入操作人姓名</div>
              </div>
              <div className="h-[40px] px-[18px] rounded-[10px] bg-[#272b30] flex items-center text-white text-[13px] font-semibold">查询</div>
              <div className="ml-auto h-[40px] px-[16px] rounded-[10px] border border-[#efefef] bg-white flex items-center gap-[7px] text-[#272b30] text-[13px] font-semibold">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10M5.333 6.667L8 9.333l2.667-2.666M8 9.333V2" stroke="#272B30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                导出日志
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: 筛选激活状态 */}
        <div>
          <div className="flex items-center gap-[12px] mb-[20px]">
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[#272b30] flex items-center justify-center text-white text-[13px] font-semibold">2</div>
            <h3 className="font-semibold text-[18px] text-[#272b30]">筛选区（查询激活 + 条件徽标）</h3>
          </div>
          <div className="bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-[24px] w-fit">
            <div className="flex items-end gap-[12px] flex-wrap">
              <div className="flex flex-col gap-[6px]">
                <div className="text-[#6f767e] text-[12px] font-medium">时间范围</div>
                <div className="flex items-center gap-[8px]">
                  <div className="h-[40px] px-[12px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] flex items-center text-[#272b30] text-[13px] w-[140px]">2026-02-01</div>
                  <span className="text-[#9a9fa5] text-[12px]">至</span>
                  <div className="h-[40px] px-[12px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] flex items-center text-[#272b30] text-[13px] w-[140px]">2026-03-01</div>
                </div>
              </div>
              <div className="flex flex-col gap-[6px]">
                <div className="text-[#6f767e] text-[12px] font-medium">操作人</div>
                <div className="h-[40px] px-[12px] rounded-[10px] border border-[#efefef] bg-[#f4f4f4] flex items-center text-[#272b30] text-[13px] w-[160px]">张伟</div>
              </div>
              <div className="h-[40px] px-[18px] rounded-[10px] bg-[#272b30] flex items-center text-white text-[13px] font-semibold">查询</div>
              <div className="h-[40px] px-[14px] rounded-[10px] border border-[#efefef] bg-white flex items-center text-[#6f767e] text-[13px] font-semibold">重置</div>
              <div className="h-[40px] px-[16px] rounded-[10px] border border-[#efefef] bg-white flex items-center gap-[7px] text-[#272b30] text-[13px] font-semibold">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M14 10v2.667A1.333 1.333 0 0112.667 14H3.333A1.333 1.333 0 012 12.667V10M5.333 6.667L8 9.333l2.667-2.666M8 9.333V2" stroke="#272B30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                导出日志
              </div>
            </div>
            <div className="flex items-center gap-[8px] mt-[14px] pt-[14px] border-t border-[#f4f4f4] flex-wrap">
              <span className="text-[#9a9fa5] text-[12px]">当前筛选：</span>
              <span className="px-[10px] h-[24px] rounded-[6px] bg-[#f4f4f4] text-[#272b30] text-[12px] font-medium flex items-center gap-[4px]">📅 2026-02-01 至 2026-03-01</span>
              <span className="px-[10px] h-[24px] rounded-[6px] bg-[#f4f4f4] text-[#272b30] text-[12px] font-medium flex items-center gap-[4px]">👤 张伟</span>
              <span className="text-[#9a9fa5] text-[12px]">共 <span className="text-[#272b30] font-semibold">47</span> 条结果</span>
            </div>
          </div>
        </div>

        {/* Section 3: 表格区块 */}
        <div>
          <div className="flex items-center gap-[12px] mb-[20px]">
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[#272b30] flex items-center justify-center text-white text-[13px] font-semibold">3</div>
            <h3 className="font-semibold text-[18px] text-[#272b30]">日志表格 + 分页组件</h3>
          </div>
          <div className="bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden w-[820px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f4f4f4]">
                  {["序号", "操作时间", "操作人", "操作内容"].map(h => (
                    <th key={h} className="text-left px-[20px] py-[13px] text-[#6f767e] text-[12px] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { idx: 1, date: "2026-03-01", time: "17:45:22", op: "admin", content: "修改了设备「SM001 冲压机」的折旧单价为 ¥45.00/h" },
                  { idx: 2, date: "2026-03-01", time: "14:32:08", op: "张伟",  content: "手动添加了打卡记录「张伟 · 2026-02-28」" },
                  { idx: 3, date: "2026-03-01", time: "09:15:44", op: "李娜",  content: "修改了员工「陈静」的职位为「高级技师」" },
                  { idx: 4, date: "2026-02-28", time: "16:58:03", op: "admin", content: "批量导入了 8 名员工信息" },
                  { idx: 5, date: "2026-02-28", time: "10:22:31", op: "王芳",  content: "导入了 23 条打卡记录" },
                ].map((r, i) => (
                  <tr key={r.idx} className={`border-b border-[#f4f4f4] ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                    <td className="px-[20px] py-[14px] text-[#9a9fa5] text-[13px]">{r.idx}</td>
                    <td className="px-[20px] py-[14px]">
                      <div className="text-[#272b30] text-[13px] font-medium">{r.date}</div>
                      <div className="text-[#9a9fa5] text-[12px]">{r.time}</div>
                    </td>
                    <td className="px-[20px] py-[14px]">
                      <div className="flex items-center gap-[7px]">
                        <div className="w-[26px] h-[26px] rounded-full bg-[#272b30] flex items-center justify-center text-white text-[11px] font-semibold">{r.op.slice(-1)}</div>
                        <span className="text-[#272b30] text-[13px] font-semibold">{r.op}</span>
                      </div>
                    </td>
                    <td className="px-[20px] py-[14px] text-[#272b30] text-[13px]">{r.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination static */}
            <div className="flex items-center justify-between px-[24px] py-[16px] border-t border-[#f4f4f4]">
              <div className="flex items-center gap-[4px]">
                {["«", "‹", "1", "2", "3", "…", "15", "›", "»"].map((p, i) => (
                  <div key={i} className={`w-[32px] h-[32px] rounded-[8px] flex items-center justify-center text-[13px] font-semibold ${p === "1" ? "bg-[#272b30] text-white" : p === "…" ? "text-[#9a9fa5]" : "border border-[#efefef] bg-white text-[#6f767e]"}`}>{p}</div>
                ))}
              </div>
              <div className="flex items-center gap-[12px]">
                <span className="text-[#9a9fa5] text-[13px]">共 <span className="text-[#272b30] font-semibold">285</span> 条</span>
                <div className="w-[1px] h-[16px] bg-[#efefef]" />
                <div className="flex items-center gap-[6px]">
                  <span className="text-[#9a9fa5] text-[13px]">每页</span>
                  <div className="h-[30px] pl-[10px] pr-[28px] rounded-[8px] border border-[#efefef] bg-white text-[#272b30] text-[13px] font-semibold flex items-center relative">
                    20
                    <svg className="absolute right-[8px]" width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke="#9A9FA5" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <span className="text-[#9a9fa5] text-[13px]">条</span>
                </div>
                <div className="w-[1px] h-[16px] bg-[#efefef]" />
                <span className="text-[#9a9fa5] text-[13px]">第 <span className="text-[#272b30] font-semibold">1</span> / 15 页</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: 自定义分页数量 */}
        <div>
          <div className="flex items-center gap-[12px] mb-[20px]">
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[#272b30] flex items-center justify-center text-white text-[13px] font-semibold">4</div>
            <h3 className="font-semibold text-[18px] text-[#272b30]">自定义每页条数（输入状态）</h3>
          </div>
          <div className="bg-white rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] px-[24px] py-[16px] flex items-center gap-[6px] w-fit">
            <span className="text-[#9a9fa5] text-[13px]">每页</span>
            <div className="w-[64px] h-[30px] px-[8px] rounded-[8px] border border-[#272b30] bg-white text-[#272b30] text-[13px] text-center flex items-center justify-center font-semibold">30</div>
            <span className="text-[#9a9fa5] text-[13px]">条 · 回车生效</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export function OperationLogPage() {
  const [view, setView] = useState<"table" | "showcase">("table");

  return (
    <div className="px-[40px] py-[40px]">
      <div className="flex items-center justify-between mb-[28px]">
        <h1 className="font-semibold text-[32px] text-[#272b30] leading-[40px] tracking-[-0.6px]">
          操作日志
        </h1>
        <div className="flex gap-[4px] bg-[#efefef] rounded-[10px] p-[4px]">
          <button
            onClick={() => setView("table")}
            className={`px-[14px] h-[32px] rounded-[8px] text-[13px] font-semibold transition-colors ${view === "table" ? "bg-white text-[#272b30] shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "text-[#6f767e] hover:text-[#272b30]"}`}
          >功能视图</button>
          <button
            onClick={() => setView("showcase")}
            className={`px-[14px] h-[32px] rounded-[8px] text-[13px] font-semibold transition-colors ${view === "showcase" ? "bg-white text-[#272b30] shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "text-[#6f767e] hover:text-[#272b30]"}`}
          >页面设计稿</button>
        </div>
      </div>

      {view === "table" ? <OperationLogMain /> : <OperationLogShowcase />}
    </div>
  );
}
