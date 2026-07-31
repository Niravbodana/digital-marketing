const META_GRAPH = "https://graph.facebook.com/v21.0";

export function isMetaConfigured() {
  return !!(process.env.META_APP_ID && process.env.META_APP_SECRET);
}

export function getAuthUrl(state: string) {
  const appId = process.env.META_APP_ID!;
  const redirectUri = encodeURIComponent(
    process.env.META_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`
  );
  const scopes = [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list",
    "pages_read_engagement",
    "business_management",
  ].join(",");

  return `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}&response_type=code`;
}

export async function exchangeCodeForToken(code: string) {
  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri =
    process.env.META_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`;

  const url = `${META_GRAPH}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data as { access_token: string; token_type: string };
}

export async function getLongLivedToken(shortToken: string) {
  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const url = `${META_GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortToken}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data as { access_token: string; expires_in: number };
}

export async function getInstagramAccounts(userToken: string) {
  const pagesRes = await fetch(
    `${META_GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${userToken}`
  );
  const pages = await pagesRes.json();
  if (pages.error) throw new Error(pages.error.message);

  const accounts: Array<{
    accountId: string;
    username: string;
    displayName: string;
    profilePicture: string;
    pageAccessToken: string;
  }> = [];

  for (const page of pages.data || []) {
    const ig = page.instagram_business_account;
    if (ig) {
      accounts.push({
        accountId: ig.id,
        username: ig.username,
        displayName: ig.name || page.name,
        profilePicture: ig.profile_picture_url || "",
        pageAccessToken: page.access_token,
      });
    }
  }
  return accounts;
}

export async function publishToInstagram(
  igAccountId: string,
  accessToken: string,
  caption: string,
  imageUrl?: string
) {
  const mediaUrl = imageUrl || "https://picsum.photos/1080/1080";

  const containerRes = await fetch(`${META_GRAPH}/${igAccountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: mediaUrl,
      caption,
      access_token: accessToken,
    }),
  });
  const container = await containerRes.json();
  if (container.error) throw new Error(container.error.message);

  const publishRes = await fetch(
    `${META_GRAPH}/${igAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: accessToken,
      }),
    }
  );
  const published = await publishRes.json();
  if (published.error) throw new Error(published.error.message);
  return published;
}

export function createDemoAccount() {
  return {
    platform: "instagram",
    username: "bodana_digital_demo",
    displayName: "Bodana Digital (Demo)",
    profilePicture: "https://api.dicebear.com/7.x/shapes/svg?seed=bodana",
    accountId: "demo_ig_" + Date.now(),
    accessToken: "demo_token",
    isDemo: true,
  };
}
