import { Layout, Menu } from "antd";

const { Header } = Layout;

export const NavbarFrontend = () => {
  const navItems = [
    { label: "首页", key: "/", path: "/" },
    { label: "归档", key: "/archives", path: "/archives" },
    { label: "关于", key: "/about", path: "/about" },
  ];

  const menuItems = navItems.map((item) => ({
    key: item.key,
    label: (
      <a
        href={item.path}
        className="text-gray-600 hover:text-purple-600 transition-colors"
      >
        {item.label}
      </a>
    ),
  }));

  return (
    <Header
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 100,
        padding: "0 60px",
        backgroundColor: "#fafafa",
        borderBottom: "2px solid #f0f0f0",
        height: "100px",
      }}
    >
      <div
        style={{
          height: "100%",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "30px",
            fontWeight: "500",
            color: "#262626",
          }}
        >
          <a href="/" style={{ color: "inherit" }}>
            NSXZ 溺水寻舟的博客
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Menu
            mode="horizontal"
            selectedKeys={[window.location.pathname]}
            items={menuItems}
            style={{
              border: "none",
              backgroundColor: "transparent",
              fontSize: "18px",
            }}
            theme="light"
          />
        </div>
      </div>
    </Header>
  );
};
