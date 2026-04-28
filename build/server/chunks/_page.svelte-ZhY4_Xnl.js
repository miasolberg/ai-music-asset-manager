import { c as create_ssr_component, y as subscribe, x as escape } from './ssr-d5jiGDj_.js';
import { p as page } from './stores-C2Kgw52Q.js';
import { g as getCurrentUser } from './pocketbase-BMs-zgjl.js';
import './state.svelte-C-EY6ZF4.js';
import 'pocketbase';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  getCurrentUser();
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-zcdb44_START -->${$$result.title = `<title>${escape("Project")} - AI Music Manager</title>`, ""}<!-- HEAD_svelte-zcdb44_END -->`, ""} ${`<div class="flex items-center justify-center h-64" data-svelte-h="svelte-160n208"><div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>`}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-ZhY4_Xnl.js.map
