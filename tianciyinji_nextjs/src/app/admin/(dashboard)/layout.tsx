"use client";

import {
  Layout,
  Menu,
  Button,
  theme as antdTheme,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  FolderOutlined,
  TagsOutlined,
  PictureOutlined,
  FundProjectionScreenOutlined,
  CheckSquareOutlined,
  UnorderedListOutlined,
  GlobalOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAdminToken, getAdminToken } from "@/lib/admin-token";
import { adminFetch } from "@/lib/admin-fetch";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/admin/dashboard", icon: <DashboardOutlined />, label: "仪表盘" },
  { key: "/admin/articles", icon: <FileTextOutlined />, label: "文章管理" },
  { key: "/admin/categories", icon: <FolderOutlined />, label: "分类管理" },
  { key: "/admin/tags", icon: <TagsOutlined />, label: "标签管理" },
  { key: "/admin/banners", icon: <PictureOutlined />, label: "轮播图" },
  {
    key: "/admin/advertisements",
    icon: <FundProjectionScreenOutlined />,
    label: "广告管理",
  },
  { key: "/admin/tasks", icon: <CheckSquareOutlined />, label: "任务管理" },
  { key: "/admin/logs", icon: <UnorderedListOutlined />, label: "日志管理" },
  { key: "/admin/visits", icon: <GlobalOutlined />, label: "访问记录" },
  { key: "/admin/api-test", icon: <ApiOutlined />, label: "接口测试" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = antdTheme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const t = getAdminToken();
    if (!t) return;
    adminFetch<{
      statusCode: number;
      data?: { username: string };
    }>("/api/users/info", { method: "POST" })
      .then((r) => {
        if (r.statusCode === 200 && r.data?.username) {
          setUsername(r.data.username);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 992) {
      setCollapsed(true);
    }
  }, []);

  const selectedKey =
    pathname === "/admin" || pathname === "/admin/"
      ? "/admin/dashboard"
      : pathname;

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={0}
        width={256}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
        }}
      >
        <div
          style={{
            height: 64,
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          天赐印记后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => {
            router.push(key);
            if (typeof window !== "undefined" && window.innerWidth < 992) {
              setCollapsed(true);
            }
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: token.colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div>
            <span style={{ marginRight: 12 }}>{username || "…"}</span>
            <Button
              type="link"
              onClick={() => {
                clearAdminToken();
                router.replace("/admin/login");
                router.refresh();
              }}
            >
              退出登录
            </Button>
          </div>
        </Header>
        <Content style={{ margin: 16, padding: 16, background: "#fff" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
