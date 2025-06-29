
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "./types";

interface UserListProps {
  users: UserProfile[];
}

export const UserList = ({ users }: UserListProps) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">All Users</h3>
      <div className="max-h-64 overflow-y-auto space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex justify-between items-center p-3 bg-white rounded border">
            <div className="flex items-center space-x-3">
              <span className="font-medium">{user.username}</span>
              {user.is_admin && <Badge variant="secondary">Admin</Badge>}
              {user.is_banned && <Badge variant="destructive">Banned</Badge>}
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>Uses: {user.daily_uses_remaining}</span>
              <span>Total: {user.total_uses}</span>
              {user.registration_ip && <span>IP: {user.registration_ip}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
