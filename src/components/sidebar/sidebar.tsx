import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
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
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
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
    const { isDarkMode } = useSelector((state: RootState) => state.web.theme);

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
            theme={isDarkMode ? 'dark' : 'light'}
            style={{
                height: 'calc(100vh - 64px)',
                position: 'sticky',
                top: 64,
                zIndex: 100,
                borderRadius: 0,
                borderRight: `2px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
                backgroundColor: isDarkMode ? '#001529' : '#fff',
            }}
            width={200}
        >
            <div
                style={{
                    padding: '12px',
                    textAlign: 'right',
                    cursor: 'pointer',
                    borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
                    backgroundColor: isDarkMode ? '#002140' : '#fafafa',
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
                theme={isDarkMode ? 'dark' : 'light'}
                mode="inline"
                defaultSelectedKeys={[location.pathname]}
                items={getMenuItems()}
                onClick={handleMenuClick}
                style={{ borderRadius: 0 }}
            />
        </Sider>
    );
};
