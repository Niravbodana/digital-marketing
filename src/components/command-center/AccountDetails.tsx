"use client";

type Account = {
  id: string;
  username: string;
  displayName?: string | null;
  profilePicture?: string | null;
  followers: number;
  following: number;
  postsCount: number;
  bio?: string | null;
  isDemo: boolean;
  createdAt: string;
};

export function AccountDetails({ account }: { account: Account | null }) {
  if (!account) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center">
        <p className="text-3xl">📸</p>
        <p className="mt-2 text-sm text-slate-400">No account connected</p>
        <p className="mt-1 text-xs text-slate-500">Username + password se connect karo</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-pink-900/10 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold">
          {account.username[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold">@{account.username}</p>
          <p className="text-sm text-slate-400">{account.displayName}</p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${account.isDemo ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
            {account.isDemo ? "Demo Connected" : "Live Connected"}
          </span>
        </div>
      </div>

      {account.bio && (
        <p className="mt-4 text-sm leading-relaxed text-slate-300 whitespace-pre-line">{account.bio}</p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/5 p-3 text-center">
          <p className="text-lg font-bold">{account.postsCount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Posts</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-center">
          <p className="text-lg font-bold">{account.followers.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Followers</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3 text-center">
          <p className="text-lg font-bold">{account.following.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Following</p>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-xs text-slate-500">
        <div className="flex justify-between"><span>Account ID</span><span className="text-slate-400 font-mono">{account.id.slice(0, 12)}...</span></div>
        <div className="flex justify-between"><span>Connected</span><span className="text-slate-400">{new Date(account.createdAt).toLocaleDateString()}</span></div>
        <div className="flex justify-between"><span>Access</span><span className="text-emerald-400">Full Dashboard ✓</span></div>
      </div>
    </div>
  );
}
