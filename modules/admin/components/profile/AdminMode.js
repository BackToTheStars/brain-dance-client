import { USER_MODE_ADMIN } from "@/config/user";
import { useAdminContext } from "../../contexts/AdminContext";

const AdminMode = () => {
  const { adminUser } = useAdminContext();

  return adminUser?.mode === USER_MODE_ADMIN ? (
    <h4>User mode: {USER_MODE_ADMIN}</h4>
  ): ''
}

export default AdminMode