import { Layout, Menu, Switch } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '@/store/slice';

const { Header } = Layout;

export const Navbar = () => {
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state: any) => state.web.theme.isDarkMode);

    const navItems = [
        { label: '首页', key: '/', path: '/' },
        { label: '项目', key: '/projects', path: '/projects' },
        { label: '关于', key: '/about', path: '/about' },
    ];

    const menuItems = navItems.map(item => ({
        key: item.key,
        label: (
            <a href={item.path}>
                {item.label}
            </a>
        ),
    }));

    return (
        <Header
            style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
                padding: '0 24px',
                backgroundColor: isDarkMode ? '#1f1f1f' : '#fafafa',
                borderBottom: `2px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
                height: '100px',
            }}
        >
            <div style={{
                height: '100%',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{
                    fontSize: '30px',
                    fontWeight: '500',
                    color: isDarkMode ? '#e6e6e6' : '#262626',
                }}>
                    <a href="/" style={{ color: 'inherit' }}>
                        NSXZ 溺水寻舟的博客
                    </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Menu
                        mode="horizontal"
                        selectedKeys={[window.location.pathname]}
                        items={menuItems}
                        style={{
                            border: 'none',
                            backgroundColor: 'transparent',
                            fontSize: '18px',
                        }}
                        theme={isDarkMode ? 'dark' : 'light'}
                    />

                    <Switch
                        checkedChildren={<BulbOutlined />}
                        unCheckedChildren={<BulbOutlined />}
                        checked={isDarkMode}
                        onChange={() => dispatch(toggleTheme())}
                        style={{
                            marginLeft: '16px',
                            scale: '0.9'
                        }}
                    />
                </div>
            </div>
        </Header>
    );
};

