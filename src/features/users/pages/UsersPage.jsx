import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { asyncSetUsers } from "../states/action";

function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(asyncSetUsers());
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Daftar Pengguna</h1>
      {users.length === 0 ? (
        <p className="text-slate-600">Belum ada pengguna.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              {user.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-sm text-slate-600">{user.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UsersPage;
