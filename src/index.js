const { NormalModule } = require("webpack");
const PLUGIN_NAME = "FCBPlugin";

module.exports = class FindContributorPlugin {
    constructor(options = { enabled: true }) {
        this.options = options;
    }

    apply(compiler) {
        if(!this.options.enabled) return;
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(PLUGIN_NAME, (_, normalModule) => {
                const moduleRequest = normalModule.userRequest.replace(/\\/g, '/');
                normalModule.loaders.push({
                    loader: require.resolve("./loader.js"),
                    options: {
                        path: moduleRequest
                    }
                });
            });
        });
    };
};
