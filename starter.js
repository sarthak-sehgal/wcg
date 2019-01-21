const reactConfig = {
    module: {
        rules: "rules_come_here"
    },
    resolve: {
        extensions: [
            ".js",
            ".jsx"
        ]
    },
    devServer: {
        contentBase: "./dist"
    }
};

const vueConfig = {
    module: {
        rules: "rules_come_here"
    },
    resolve: {
        extensions: [
            ".js",
            ".vue"
        ]
    },
    plugins: [
        "vue_loader_here"
    ]
};

const reactRules = [
    {
        test: /.(js|jsx)$/,
        use: "babel-loader",
        exclude: "/node_modules/"
    }
];

const vueRules = [
    {
        test: /\.vue$/,
        loader: "vue-loader"
    },
    {
        test: /\.js$/,
        loader: "babel-loader"
    }
];

module.exports = { reactConfig, vueConfig, reactRules, vueRules };