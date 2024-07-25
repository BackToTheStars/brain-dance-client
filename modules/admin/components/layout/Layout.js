import AdminHeader from "./Header";

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <div className="container mx-auto">
        <AdminHeader />
        <main className="p-2">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
