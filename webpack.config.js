const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "docs/public/js"),
        filename: "app.bundle.js"
    },
    module: {
        rules: [{
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
                loader: "ts-loader",
            }
        }]
    },
    mode: "production",
    watch: true,
    resolve: {
        extensions: [".ts", ".js"],
    }

}