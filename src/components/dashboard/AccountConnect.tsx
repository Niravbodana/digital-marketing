"use client";

type Account = {
  id: string;
  username: string;
  displayName?: string | null;
  profilePicture?: string | null;
  isDemo: boolean;
};

export function AccountConnect({
  accounts,
  onConnectDemo,
  onConnectReal,
  onDisconnect,
  loading,
}: {
  accounts: Account[];
  onConnectDemo: () => void;
  onConnectReal: () => void;
  onDisconnect: (id: string) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onConnectReal}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <span>📸</span> Connect Instagram (Real)
        </button>
        <button
          onClick={onConnectDemo}
          disabled={loading}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          Demo Account Connect
        </button>
      </div>

      {accounts.length === 0 ? (
        <p className="text-sm text-slate-500">
          Koi account connected nahi. Real OAuth ke liye Meta App ID chahiye (.env).
        </p>
      ) : (
        <ul className="space-y-2">
          {accounts.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold">
                  {a.username[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">@{a.username}</p>
                  <p className="text-xs text-slate-500">
                    {a.isDemo ? "Demo Mode" : "Live · Connected"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDisconnect(a.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Disconnect
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
