// Cloudflare Pages Function for /p/[slug] clean path routing
export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Return main SPA index.html so client-side router reads window.location.pathname
  return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
}
