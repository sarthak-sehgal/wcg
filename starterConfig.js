const reactConfig = {
  module: {
    rules: "rules_come_here"
  },
  resolve: {
    extensions: [".js", ".jsx"]
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
    extensions: [".js", ".vue"]
  },
  plugins: ["vue_loader_here"]
};

const defaultConfig = {
  module: {
    rules: "rules_come_here"
  },
  resolve: {
    extensions: []
  }
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

const reactNpm = {
  dev: [
    "webpack",
    "webpack-cli",
    "babel-loader",
    "@babel/preset-react",
    "@babel/core",
    "@babel/preset-env",
    "webpack-dev-server"
  ],
  save: ["react", "react-dom", "react-hot-loader"]
};

const vueNpm = {
  dev: [
    "webpack",
    "webpack-cli",
    "vue-loader",
    "vue-template-compiler",
    "babel-loader",
    "@babel/core",
    "@babel/preset-env"
  ],
  save: ["vue"]
};

const defaultNpm = {
	dev: ["webpack", "webpack-cli"],
	save: []
};

const styleRules = {
  css: {
    test: /\.css$/,
    use: ["style-loader", "css-loader"]
  },
  cssModules: {
    test: /\.css$/,
    use: [
      "style-loader",
      {
        loader: "css-loader",
        options: {
          importLoaders: 1,
          modules: true
        }
      }
    ]
  },
  sass: {
    test: /\.scss$/,
    use: ["style-loader", "css-loader", "sass-loader"]
  }
};

const imageAndFontRules = {
	test: null,
	use: "url-loader"
};

const htmlRules = {
	test: /\.html$/,
	use: ['html-loader']
}

module.exports = {
  reactConfig,
	vueConfig,
	defaultConfig,
  reactRules,
  vueRules,
  reactNpm,
  vueNpm,
  defaultNpm,
	styleRules,
	imageAndFontRules,
	htmlRules
};
