interface Env {
  DEMO_PASSWORD?: string;
  DEMO_PASSWORD_SHA256?: string;
  SESSION_SECRET?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}

const COOKIE_NAME = "dsa_coach_demo_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export async function onRequest(context: PagesContext): Promise<Response> {
  const url = new URL(context.request.url);
  if (url.pathname === "/login") {
    return context.request.method === "POST" ? handleLogin(context) : loginPage(context);
  }
  if (isPublicAsset(url.pathname)) return context.next();
  if (!authConfigured(context.env)) return setupMissingResponse();
  if (await hasValidSession(context.request, context.env)) return context.next();
  if (wantsJson(context.request)) return json({ error: "Authentication required" }, 401);
  return Response.redirect(new URL(`/login?next=${encodeURIComponent(`${url.pathname}${url.search}`)}`, url), 302);
}

async function handleLogin(context: PagesContext): Promise<Response> {
  if (!authConfigured(context.env)) return setupMissingResponse();
  const url = new URL(context.request.url);
  const form = await context.request.formData();
  const password = String(form.get("password") ?? "");
  if (!(await passwordMatches(password, context.env))) {
    return loginPage(context, "Incorrect password.", 401);
  }
  const next = safeNextPath(String(form.get("next") ?? "/"));
  const session = await signSession(context.env);
  const secure = url.protocol === "https:" ? "; Secure" : "";
  return new Response(null, {
    status: 302,
    headers: {
      location: next,
      "set-cookie": `${COOKIE_NAME}=${session}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly${secure}; SameSite=Lax`
    }
  });
}

function loginPage(context: PagesContext, error = "", status = 200): Response {
  const url = new URL(context.request.url);
  const next = safeNextPath(url.searchParams.get("next") ?? "/");
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DSA Coach</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f7f4ed; color: #1e282c; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; }
    main { width: min(420px, calc(100vw - 32px)); border: 1px solid #d8d0c2; border-radius: 8px; background: #fffdf8; box-shadow: 0 24px 60px rgba(44, 52, 54, 0.12); padding: 28px; }
    .eyebrow { margin: 0 0 8px; color: #00727b; font-size: 12px; line-height: 1; text-transform: uppercase; letter-spacing: .08em; font-weight: 800; }
    h1 { margin: 0 0 10px; font-size: 30px; line-height: 1.05; }
    p { margin: 0 0 22px; color: #53666b; line-height: 1.5; }
    label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 800; color: #34474c; text-transform: uppercase; letter-spacing: .04em; }
    input { box-sizing: border-box; width: 100%; border: 1px solid #cfc6b8; border-radius: 7px; padding: 12px 13px; font: inherit; background: #fff; color: inherit; }
    input:focus { outline: 3px solid rgba(0, 114, 123, .2); border-color: #00727b; }
    button { margin-top: 16px; width: 100%; border: 0; border-radius: 7px; padding: 12px 14px; font: inherit; font-weight: 800; background: #00727b; color: white; cursor: pointer; }
    .error { border: 1px solid #e4a29b; background: #fff2ef; color: #9f2d20; border-radius: 7px; padding: 10px 12px; margin-bottom: 16px; font-weight: 700; }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">Private demo</p>
    <h1>DSA Coach</h1>
    <p>Enter the demo password to open the practice workspace.</p>
    ${error ? `<div class="error">${escapeHtml(error)}</div>` : ""}
    <form method="post" action="/login">
      <input type="hidden" name="next" value="${escapeHtml(next)}" />
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" autofocus />
      <button type="submit">Open DSA Coach</button>
    </form>
  </main>
</body>
</html>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

async function hasValidSession(request: Request, env: Env): Promise<boolean> {
  const value = cookieValue(request.headers.get("cookie") ?? "", COOKIE_NAME);
  if (!value || !env.SESSION_SECRET) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(payload, env.SESSION_SECRET);
  if (signature !== expected) return false;
  try {
    const session = JSON.parse(decodeBase64Url(payload)) as { exp?: number };
    return typeof session.exp === "number" && session.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

async function signSession(env: Env): Promise<string> {
  if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET is not configured");
  const payload = encodeBase64Url(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }));
  return `${payload}.${await hmac(payload, env.SESSION_SECRET)}`;
}

async function passwordMatches(password: string, env: Env): Promise<boolean> {
  if (env.DEMO_PASSWORD_SHA256) return await sha256Hex(password) === env.DEMO_PASSWORD_SHA256.toLowerCase();
  return Boolean(env.DEMO_PASSWORD) && password === env.DEMO_PASSWORD;
}

function authConfigured(env: Env): boolean {
  return Boolean(env.SESSION_SECRET && (env.DEMO_PASSWORD || env.DEMO_PASSWORD_SHA256));
}

function setupMissingResponse(): Response {
  return new Response("Cloudflare demo auth is not configured. Set SESSION_SECRET plus DEMO_PASSWORD or DEMO_PASSWORD_SHA256.", {
    status: 503,
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}

function isPublicAsset(pathname: string): boolean {
  return pathname === "/favicon.ico" || pathname === "/app-icon.svg";
}

function wantsJson(request: Request): boolean {
  return request.headers.get("accept")?.includes("application/json") || new URL(request.url).pathname.startsWith("/api/");
}

function safeNextPath(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function cookieValue(header: string, name: string): string | undefined {
  return header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return encodeBase64Url(new Uint8Array(signature));
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function encodeBase64Url(value: string | Uint8Array): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeBase64Url(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return atob(normalized);
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
