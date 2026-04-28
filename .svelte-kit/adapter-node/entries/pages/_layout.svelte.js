import { c as create_ssr_component, e as escape, v as validate_component } from "../../chunks/ssr.js";
import { g as getCurrentUser, i as isAuthenticated } from "../../chunks/pocketbase.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/state.svelte.js";
const Navigation = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let user = getCurrentUser();
  let authenticated = isAuthenticated();
  return `<nav class="bg-surface border-b border-gray-800"><div class="container mx-auto px-4"><div class="flex items-center justify-between h-16"> <a href="/" class="flex items-center gap-3" data-svelte-h="svelte-is36o8"><div class="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg></div> <span class="text-lg font-bold text-white">AI Music Manager</span></a>  <div class="flex items-center gap-6">${authenticated ? `<div class="flex items-center gap-4"><span class="text-sm text-gray-400">${escape(user?.name || user?.email)}</span> <button class="text-sm text-gray-400 hover:text-white transition-colors" data-svelte-h="svelte-6qo2tl">Logout</button></div>` : `<a href="/login" class="text-sm text-gray-400 hover:text-white transition-colors" data-svelte-h="svelte-yj8bc2">Login</a>`}</div></div></div></nav>`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="min-h-screen bg-darker">${validate_component(Navigation, "Navigation").$$render($$result, {}, {}, {})} <main class="container mx-auto px-4 py-8">${slots.default ? slots.default({}) : ``}</main></div>`;
});
export {
  Layout as default
};
