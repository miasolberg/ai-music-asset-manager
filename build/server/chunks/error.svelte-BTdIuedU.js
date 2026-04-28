import { c as create_ssr_component, y as subscribe, x as escape } from './ssr-d5jiGDj_.js';
import { p as page } from './stores-C2Kgw52Q.js';
import './state.svelte-C-EY6ZF4.js';

const Error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_page();
  return `<h1>${escape($page.status)}</h1> <p>${escape($page.error?.message)}</p>`;
});

export { Error as default };
//# sourceMappingURL=error.svelte-BTdIuedU.js.map
