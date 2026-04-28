import { c as create_ssr_component, d as subscribe, e as escape } from "../../../../chunks/ssr.js";
import { p as page } from "../../../../chunks/stores.js";
import { g as getCurrentUser } from "../../../../chunks/pocketbase.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => value);
  getCurrentUser();
  $$unsubscribe_page();
  return `${$$result.head += `<!-- HEAD_svelte-zcdb44_START -->${$$result.title = `<title>${escape("Project")} - AI Music Manager</title>`, ""}<!-- HEAD_svelte-zcdb44_END -->`, ""} ${`<div class="flex items-center justify-center h-64" data-svelte-h="svelte-160n208"><div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>`}`;
});
export {
  Page as default
};
