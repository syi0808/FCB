const { NormalModule } = require("webpack");
const PLUGIN_NAME = "FCBPlugin";

module.exports = class FindContributorPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(PLUGIN_NAME, (_, normalModule) => {
                var moduleRequest = normalModule.userRequest.replace(/\\/g, '/');
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
