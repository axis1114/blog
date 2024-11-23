import { Layout, Switch } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '@/store/slice';

const { Header } = Layout;

export const NavbarBackend = () => {
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state: any) => state.web.theme.isDarkMode);

    return (
        <Header
            style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
                padding: '0 24px',
                backgroundColor: isDarkMode ? '#001529' : '#fff',
                borderBottom: `2px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
                height: '64px',
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
                    fontSize: '20px',
                    fontWeight: '500',
                    color: isDarkMode ? '#fff' : '#001529',
                }}>
                    <a href="/admin" style={{ color: 'inherit' }}>
                        NSXZ 后台管理
                    </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <a
                        href="/"
                        style={{
                            color: isDarkMode ? '#fff' : '#001529',
                            marginRight: '16px'
                        }}
                    >
                        返回首页
                    </a>
                    <Switch
                        checkedChildren={<BulbOutlined />}
                        unCheckedChildren={<BulbOutlined />}
                        checked={isDarkMode}
                        onChange={() => dispatch(toggleTheme())}
                        style={{
                            marginLeft: '16px',
                        }}
                    />
                </div>
            </div>
        </Header>
    );
};

