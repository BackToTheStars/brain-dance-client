'use client'
import { AdminProvider, useAdminContext } from "@/modules/admin/contexts/AdminContext"
import DashboardLayout from "@/modules/dashboard/components/layout/Dashboard";

const PrivateWrapper = ({ children }) => {
  const { adminUser } = useAdminContext();
  if (!adminUser || adminUser.mode !== 'admin') return;
  return children
}

const DashboardPageLayout = ({children}) => {
  return (
    <AdminProvider>
      <PrivateWrapper>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </PrivateWrapper>
    </AdminProvider>
  )
}

export default DashboardPageLayout