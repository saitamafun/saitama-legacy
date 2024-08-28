import { LoginDialog, RequestPermission, usePermission } from "@saitamafun/wallet";

export default function ProtectedRoute() {
  const { hasPermission } = usePermission();

  return hasPermission ? <LoginDialog /> : <RequestPermission />;
}
