import {
  DollarCircleOutlined,
  LineChartOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

// 1. 抽取统计卡片组件
const StatisticCard = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  color,
}: {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <Card bordered={false}>
    <Statistic
      title={
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
      }
      value={value}
      prefix={prefix}
      suffix={suffix}
      valueStyle={{ color: `var(--ant-${color}-6)` }}
    />
  </Card>
);

// 2. 抽取图表配置
const getChartOptions = {
  // 访问趋势配置
  visitOption: {
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "访问量",
        type: "line",
        smooth: true,
        areaStyle: {
          opacity: 0.3,
        },
        data: [820, 932, 901, 934, 1290, 1330, 1320],
      },
    ],
  },

  // 用户分布配置
  userDistributionOption: {
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      right: 10,
      top: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "20",
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 1048, name: "北京" },
          { value: 735, name: "上海" },
          { value: 580, name: "广州" },
          { value: 484, name: "深圳" },
          { value: 300, name: "其他" },
        ],
      },
    ],
  },
};

export const AdminHome = () => {
  // 3. 使用 useMemo 优化统计数据
  const statisticsData = useMemo(
    () => [
      {
        title: "总用户数",
        value: 1234,
        icon: <UserOutlined className="text-blue-500 text-2xl" />,
        color: "blue",
      },
      {
        title: "今日订单",
        value: 156,
        icon: <ShoppingCartOutlined className="text-green-500 text-2xl" />,
        color: "green",
      },
      {
        title: "月收入",
        value: 88888,
        prefix: "¥",
        icon: <DollarCircleOutlined className="text-yellow-500 text-2xl" />,
        color: "yellow",
      },
      {
        title: "转化率",
        value: 12.3,
        suffix: "%",
        icon: <LineChartOutlined className="text-purple-500 text-2xl" />,
        color: "purple",
      },
    ],
    []
  );

  // 4. 使用 useMemo 优化图表配置
  const { visitOption, userDistributionOption } = useMemo(
    () => getChartOptions,
    []
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        {statisticsData.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <StatisticCard {...stat} />
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="访问趋势" bordered={false}>
            <ReactECharts option={visitOption} style={{ height: "400px" }} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="用户分布" bordered={false}>
            <ReactECharts
              option={userDistributionOption}
              style={{ height: "400px" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
