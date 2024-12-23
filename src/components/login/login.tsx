import { GenCaptcha } from "@/api/system";
import { Login, userInfo } from "@/api/user";
import { login } from "@/store/slice";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const LoginWrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
`;

const LoginTitle = styled.h2`
  text-align: center;
  margin-bottom: 30px;
  color: #1890ff;
`;

interface LoginForm {
  account: string; // 用户账号
  password: string; // 用户密码
  captcha: string; // 验证码
}

export const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  // 获取重定向地址，默认为管理后台首页
  const from = (location.state as any)?.from?.pathname || "/admin";

  // 验证码相关状态
  const [captchaId, setCaptchaId] = useState<string>("");
  const [captchaUrl, setCaptchaUrl] = useState<string>("");

  const refreshCaptcha = async () => {
    try {
      const res = await GenCaptcha();
      if (res.code === 0) {
        setCaptchaId(res.data.captcha_id);
        setCaptchaUrl(res.data.pic_path);
      } else {
        message.error(res.message);
      }
    } catch (error) {
      console.error("获取验证码失败:", error);
      message.error("获取验证码失败");
    }
  };

  // 组件挂载时获取验证码
  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleLogin = async (values: LoginForm) => {
    try {
      setLoading(true);
      const res = await Login({
        account: values.account,
        password: values.password,
        captcha: values.captcha,
        captcha_id: captchaId,
      });

      if (res.code === 0) {
        const userRes = await userInfo({
          headers: { Authorization: `Bearer ${res.data}` },
        });
        dispatch(login(userRes.data));
        message.success("登录成功！");
        navigate(from);
      } else {
        message.error(res.message);
        refreshCaptcha();
      }
    } catch (error) {
      console.error("登录失败:", error);
      message.error("登录失败，请重试！");
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginWrapper>
      <LoginCard>
        <LoginTitle>管理员登录</LoginTitle>
        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="account"
            rules={[{ required: true, message: "请输入用户名！" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码！" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="captcha"
            rules={[{ required: true, message: "请输入验证码！" }]}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <Input placeholder="验证码" />
              <img
                src={captchaUrl}
                alt="验证码"
                style={{ cursor: "pointer", height: "32px", width: "200px" }}
                onClick={refreshCaptcha}
              />
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </LoginCard>
    </LoginWrapper>
  );
};
