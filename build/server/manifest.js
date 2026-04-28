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
		client: {start:"_app/immutable/entry/start.BtQUrmTs.js",app:"_app/immutable/entry/app.B0O3d6fE.js",imports:["_app/immutable/entry/start.BtQUrmTs.js","_app/immutable/chunks/BZ4dk_Gh.js","_app/immutable/chunks/BBynUqYS.js","_app/immutable/entry/app.B0O3d6fE.js","_app/immutable/chunks/BBynUqYS.js","_app/immutable/chunks/Q7wn0M_M.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BEpm3iqE.js')),
			__memo(() => import('./chunks/1-D3RCGNqT.js')),
			__memo(() => import('./chunks/2-BzzoXiyt.js')),
			__memo(() => import('./chunks/3-DrypdT3h.js')),
			__memo(() => import('./chunks/4-Da-v6vG8.js'))
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
