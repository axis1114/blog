import {
  BilibiliOutlined,
  GithubOutlined,
  MailOutlined,
  QqOutlined,
  WechatOutlined,
} from "@ant-design/icons";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

// 联系方式配置
const CONTACT_ITEMS = [
  { icon: <QqOutlined />, text: "QQ", action: "#" },
  { icon: <MailOutlined />, text: "邮箱", action: "#" },
  { icon: <WechatOutlined />, text: "WeChat", action: "#" },
  {
    icon: <GithubOutlined />,
    text: "Github",
    action: "https://github.com/nsxz",
  },
  {
    icon: <BilibiliOutlined />,
    text: "B站",
    action: "https://space.bilibili.com/1966087641",
  },
] as const;

// 信息卡片组件
const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => (
  <Card className="h-full bg-white/80 backdrop-blur-sm">
    <Title level={3} className="text-blue-600">
      {title}
    </Title>
    <Paragraph className="text-gray-600">{children}</Paragraph>
  </Card>
);

// 社交链接组件
const SocialLink = ({ icon, text, action }: (typeof CONTACT_ITEMS)[number]) => (
  <a
    href={action}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg hover:bg-blue-100 
               transition-colors duration-300 cursor-pointer no-underline">
    <span className="text-blue-500 text-xl">{icon}</span>
    <span className="text-gray-600">{text}</span>
  </a>
);

export const WebAbout = () => (
  <div className="min-h-screen bg-gradient-to-br to-indigo-50 py-16">
    <div className="container mx-auto px-4 max-w-6xl">
      {/* 标题 */}
      <div className="text-center mb-16">
        <Title
          level={1}
          className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          关于
        </Title>
      </div>

      {/* 内容区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <InfoCard title="本站介绍">
          个人博客，用于记录个人学习和工作中遇到的问题和解决方案。
        </InfoCard>

        <InfoCard title="个人介绍" />

        {/* 社交链接 */}
        <div className="md:col-span-2">
          <Card className="border-none bg-white/80 backdrop-blur-sm">
            <Title level={3} className="text-blue-600">
              Follow me
            </Title>
            <div className="grid md:grid-cols-3 gap-6">
              {CONTACT_ITEMS.map((item, index) => (
                <SocialLink key={index} {...item} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
);
