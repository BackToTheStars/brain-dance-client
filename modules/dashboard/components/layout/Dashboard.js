import React from 'react';
import { Breadcrumb, Layout, Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const { Header, Content } = Layout;

const menuItems = [
  {
    key: 'games',
    label: <Link href="/dashboard">Games</Link>,
  },
  {
    key: 'turns',
    label: <Link href="/dashboard/turns">Turns</Link>,
  },
  {
    key: 'lines',
    label: <Link href="/dashboard/lines">Lines</Link>,
  },
  {
    key: 'classes',
    label: <Link href="/dashboard/classes">Classes</Link>,
  },
];

const DashboardLayout = ({ children }) => {
  const pathname = usePathname();
  return (
    <Layout className="layout" style={{ height: '100%' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          defaultSelectedKeys={[
            menuItems.find((item) => pathname.includes(item.key))?.key || 'games',
          ]}
        />
      </Header>
      <Content
        style={{
          padding: '10px 50px',
          maxHeight: '100%', overflowY: 'auto'
        }}
      >
        <div className="site-layout-content">{children}</div>
      </Content>
    </Layout>
  );
};
export default DashboardLayout;
