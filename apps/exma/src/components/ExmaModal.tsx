import { WalletDialog, type User } from "@saitamafun/wallet";
import ProtectedRoute from "./ProtectedRoute";

type ExmaModalProps = {
  user: User | null;
};

export default function ExmaModal({ user }: ExmaModalProps) {
  return user ? <WalletDialog /> : <ProtectedRoute />;
}
