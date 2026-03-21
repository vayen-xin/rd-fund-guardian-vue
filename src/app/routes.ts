import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { PersonnelPage } from "./pages/PersonnelPage";
import { EquipmentPage } from "./pages/EquipmentPage";
import { AttendancePage } from "./pages/AttendancePage";
import { ProjectListPage } from "./pages/ProjectListPage";
import { CreateProjectPage } from "./pages/CreateProjectPage";
import { ProjectMonthlyPage } from "./pages/ProjectMonthlyPage";
import { SettlementPage } from "./pages/SettlementPage";
// import { CompaniesPage } from "./pages/CompaniesPage"; // 暂时注释，待修复
import { OperationLogPage } from "./pages/OperationLogPage";
import { AccountPage } from "./pages/AccountPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "personnel", Component: PersonnelPage },
      { path: "equipment", Component: EquipmentPage },
      { path: "attendance", Component: AttendancePage },
      // { path: "companies", Component: CompaniesPage }, // 暂时注释
      { path: "projects", Component: ProjectListPage },
      { path: "projects/create", Component: CreateProjectPage },
      { path: "projects/:projectId/monthly", Component: ProjectMonthlyPage },
      { path: "projects/:projectId/settlement", Component: SettlementPage },
      { path: "settlements", Component: SettlementPage },
      { path: "operation-log", Component: OperationLogPage },
      { path: "accounts", Component: AccountPage },
    ],
  },
]);
