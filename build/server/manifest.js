const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.BiYVjEhD.js",app:"_app/immutable/entry/app.XZ1swJGf.js",imports:["_app/immutable/entry/start.BiYVjEhD.js","_app/immutable/chunks/CvowtAWn.js","_app/immutable/chunks/BBynUqYS.js","_app/immutable/entry/app.XZ1swJGf.js","_app/immutable/chunks/BBynUqYS.js","_app/immutable/chunks/Q7wn0M_M.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-D3k7Hvpl.js')),
			__memo(() => import('./chunks/1-CwlT4aYG.js')),
			__memo(() => import('./chunks/2-CyPNxFL8.js')),
			__memo(() => import('./chunks/3-BVl04Fmo.js')),
			__memo(() => import('./chunks/4-BSrwPBVc.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/login",
				pattern: /^\/login\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/projects/[id]",
				pattern: /^\/projects\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
