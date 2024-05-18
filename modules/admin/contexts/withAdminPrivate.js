'use client';

import { Spin } from 'antd';
import { useAdminContext } from './AdminContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const withAdminPrivate = (WrappedComponent) => (props) => {
  const { adminUser } = useAdminContext();
  const router = useRouter();
  useEffect(() => {
    if (adminUser?.loaded && !adminUser?.token) {
      router.push('/admin/login');
    }
  }, [adminUser]);


  if (!adminUser?.token) {
    return <Spin />;
  }

  return <WrappedComponent {...props} />;
};

export default withAdminPrivate;
