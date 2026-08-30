// Cloudflare Pages Function for /u/[slug] dynamic routing
export async function onRequest(context: any) {
  const { request, params, env } = context;
  const url = new URL(request.url);
  const slug = params.slug;

  // Rewrite to root SPA index.html so the client router processes the slug
  return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
}
