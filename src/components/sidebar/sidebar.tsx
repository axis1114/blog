import React, { useState } from 'react';
import { Layout, Menu,  } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    SettingOutlined,
    UserOutlined,
    FileOutlined,
    PictureOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface MenuItem {
    key: string;
    icon?: React.ReactNode;
    label: string;
    children?: MenuItem[];
}

export const Sidebar: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const getMenuItems = (): MenuItem[] => {
        return [
            {
                key: '/admin',
                icon: <DashboardOutlined />,
                label: '仪表盘'
            },
            {
                key: '/admin/users',
                icon: <UserOutlined />,
                label: '用户管理'
            },
            {
                key: '/admin/articles',
                icon: <FileOutlined />,
                label: '文章管理'
            },
            {
                key: '/admin/images',
                icon: <PictureOutlined />,
                label: '图片管理'
            },
            {
                key: '/admin/settings',
                icon: <SettingOutlined />,
                label: '设置'
            }
        ];
    };

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme="light"
            style={{
                height: 'calc(100vh - 64px)',
                position: 'sticky',
                top: 64,
                zIndex: 100,
                borderRadius: 0,
                borderRight: '2px solid #f0f0f0',
                backgroundColor: '#fff',
            }}
            width={200}
        >
            <div
                style={{
                    padding: '12px',
                    textAlign: 'right',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onClick={() => setCollapsed(!collapsed)}
            >
                {collapsed ? (
                    <MenuUnfoldOutlined style={{ fontSize: '16px', color: '#595959' }} />
                ) : (
                    <MenuFoldOutlined style={{ fontSize: '16px', color: '#595959' }} />
                )}
            </div>

            <Menu
                theme="light"
                mode="inline"
                defaultSelectedKeys={[location.pathname]}
                items={getMenuItems()}
                onClick={handleMenuClick}
                style={{ borderRadius: 0 }}
            />
        </Sider>
    );
};
