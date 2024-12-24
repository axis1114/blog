import {
  MailOutlined,
  QqOutlined,
  WechatOutlined,
  BilibiliOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export const WebAbout = () => {
  const contactItems = [
    {
      icon: <QqOutlined />,
      text: "QQ",
      action: "",
    },
    {
      icon: <MailOutlined />,
      text: "邮箱",
      action: "",
    },
    {
      icon: <WechatOutlined />,
      text: "WeChat",
      action: "",
    },
    {
      icon: <GithubOutlined />,
      text: "我的Github",
      action: "https://github.com/nsxz",
    },
    {
      icon: <BilibiliOutlined />,
      text: "我的B站",
      action: "https://space.bilibili.com/1966087641?spm_id_from=333.1007.0.0",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br  to-indigo-50 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <Title
            level={1}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            关于
          </Title>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card className="h-full bg-white/80 backdrop-blur-sm">
              <Title level={3} className="text-blue-600">
                本站介绍
              </Title>
              <Paragraph className="text-gray-600">
                本站是一个个人博客，用于记录个人学习和工作中遇到的问题和解决方案。
              </Paragraph>
            </Card>
          </div>

          <div>
            <Card className="h-full bg-white/80 backdrop-blur-sm">
              <Title level={3} className="text-blue-600">
                个人介绍
              </Title>
              <Paragraph className="text-gray-600">
                无业游民，喜欢编程，喜欢折腾，喜欢分享。
              </Paragraph>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className=" border-none bg-white/80 backdrop-blur-sm">
              <Title level={3} className="text-blue-600">
                Follow me
              </Title>
              <div className="grid md:grid-cols-3 gap-6">
                {contactItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.action}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors duration-300 cursor-pointer no-underline"
                  >
                    <span className="text-blue-500 text-xl">{item.icon}</span>
                    <span className="text-gray-600">{item.text}</span>
                  </a>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
