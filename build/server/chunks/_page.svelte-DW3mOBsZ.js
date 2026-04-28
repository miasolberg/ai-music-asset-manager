import { c as create_ssr_component, z as each } from './ssr-d5jiGDj_.js';
import './pocketbase-Dd6vsoao.js';
import './state.svelte-C-EY6ZF4.js';
import 'pocketbase';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-gihh0a_START -->${$$result.title = `<title>AI Music Asset Manager</title>`, ""}<!-- HEAD_svelte-gihh0a_END -->`, ""} <div class="space-y-8"> <div class="flex items-center justify-between"><div data-svelte-h="svelte-60aw3f"><h1 class="text-3xl font-bold text-white">Projects</h1> <p class="text-gray-400 mt-1">Manage your AI-generated music projects</p></div> <button class="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2" data-svelte-h="svelte-1f5v8sf"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
			New Project</button></div>  ${`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${each(Array(6), (_) => {
    return `<div class="bg-surface rounded-xl h-64 animate-pulse"></div>`;
  })}</div>`}</div>  ${``}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-DW3mOBsZ.js.map
