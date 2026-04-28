import { c as create_ssr_component, e as escape, g as add_attribute } from "../../../chunks/ssr.js";
import "../../../chunks/pocketbase.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../chunks/state.svelte.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email = "";
  let password = "";
  return `${$$result.head += `<!-- HEAD_svelte-eq8sx3_START -->${$$result.title = `<title>${escape("Login")} - AI Music Manager</title>`, ""}<!-- HEAD_svelte-eq8sx3_END -->`, ""} <div class="min-h-screen flex items-center justify-center"><div class="w-full max-w-md"> <div class="text-center mb-8"><div class="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4" data-svelte-h="svelte-i9zcpo"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg></div> <h1 class="text-2xl font-bold text-white" data-svelte-h="svelte-19nsh4v">AI Music Manager</h1> <p class="text-gray-400 mt-1">${escape("Sign in to your account")}</p></div>  <div class="bg-surface rounded-xl p-6 space-y-4">${``} <form class="space-y-4"><div><label class="block text-sm font-medium text-gray-300 mb-2" data-svelte-h="svelte-12c6v5u">Email</label> <input type="email" required class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none" placeholder="you@example.com"${add_attribute("value", email)}></div> ${``} <div><label class="block text-sm font-medium text-gray-300 mb-2" data-svelte-h="svelte-19yxz9n">Password</label> <input type="password" required minlength="8" class="w-full px-4 py-3 bg-darker border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none" placeholder="Min. 8 characters"${add_attribute("value", password)}></div> ${``} <button type="submit" ${""} class="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors">${`${escape("Sign In")}`}</button></form> <div class="text-center pt-4 border-t border-gray-800"><p class="text-gray-400 text-sm">${escape("Don't have an account?")} <button class="text-primary hover:text-white transition-colors font-medium">${escape("Register")}</button></p></div></div></div></div>`;
});
export {
  Page as default
};
