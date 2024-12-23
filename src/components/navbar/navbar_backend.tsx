import { Layout, Button } from "antd";
import { LogoutOutlined, HomeOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slice";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

export const NavbarBackend = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <Header
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 100,
        padding: "0 24px",
        backgroundColor: "#fff",
        borderBottom: "2px solid #f0f0f0",
        height: "64px",
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
            fontSize: "20px",
            fontWeight: "500",
            color: "#001529",
          }}
        >
          <a href="/admin" style={{ color: "inherit" }}>
            NSXZ 后台管理
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            type="link"
            icon={<HomeOutlined />}
            onClick={() => navigate("/")}
            style={{
              color: "#001529",
              marginRight: "16px",
            }}
          >
            返回首页
          </Button>
          <Button
            type="link"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              color: "#001529",
              marginRight: "16px",
            }}
          >
            注销
          </Button>
        </div>
      </div>
    </Header>
  );
};
