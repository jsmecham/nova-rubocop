const commonjs = require("@rollup/plugin-commonjs");
const { nodeResolve } = require("@rollup/plugin-node-resolve");

module.exports = {
    input: "Source/Scripts/main.js",
    plugins: [
        commonjs(),
        nodeResolve()
    ],
    output: {
        file: "RuboCop.novaextension/Scripts/main.dist.js",
        format: "cjs"
    }
};
