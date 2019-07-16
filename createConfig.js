const path = require('path'),
  fs = require('fs'),
  util = require('util'),
  beautify = require('js-beautify').js,

  starterConfig = require('./starterConfig'),
  babelConfigs = require('./babelConfig'),
  tsReactConfig = require('./tsReactConfig'),
  mkdirSync = require('./mkdirSync');

let CONFIG_DIRECTORY;

let headers = [
    "const webpack = require('webpack');",
    "const path = require('path');"
  ],
  rules = [],
  beautifyConfig = {
    indent_size: 2,
    space_in_empty_paren: true
  };

function createConfig (config, configDirectory) {
  let PATH_TO_CONFIG = path.resolve(configDirectory, 'webpack.config.js');
  CONFIG_DIRECTORY = configDirectory;

  if (!fs.existsSync(configDirectory)) {
    mkdirSync(configDirectory);
  }

  let fileConfig = {},
    npmConfig = {};

  // create files corresponding to react, vue or custom config and put in data
  if (config.library === "React") {
      npmConfig = starterConfig.reactNpm;
      fileConfig = { ...starterConfig.reactConfig };
      rules = starterConfig.reactRules;

      // delete react-hot-loader if transcript selected
      if (config.typescript) {
          delete fileConfig.devServer;
          npmConfig.dev.pop();
          npmConfig.save.pop();
      }
  } else if (config.library === "Vue") {
      npmConfig = starterConfig.vueNpm;
      fileConfig = { ...starterConfig.vueConfig };
      rules = starterConfig.vueRules;
      headers.push("const VueLoaderPlugin = require('vue-loader/lib/plugin');");
  } else {
    fileConfig = { ...starterConfig.defaultConfig }
    npmConfig = starterConfig.defaultNpm;
  }

  // resolve relative paths
  config.entry = resolveRelativePath(config.entry);
  config.filename = resolveRelativePath(config.filename);
  config.path = resolveRelativePath(config.path);

  fileConfig.entry = config.entry;
  fileConfig.output = {
      "path": "path_comes_here",
      "filename": config.filename
  };

  // push styling rules
  addStylingRules(config.styling, rules, npmConfig);

  // push image and font loader rules
  imageAndFontLoaders(config, rules, npmConfig);

  // push custom config rules if required
  if (config.library === "Custom config") {
    addCustomConfigRules(config, rules, npmConfig);
  }

  // add transcript loader and make other changed if typescript
  if (config.typescript) {
      // if entry file is .js, make it .tsx
      config.entry = config.entry.replace('.js', '.tsx');

      fileConfig.resolve.extensions.push('.tsx', '.ts');

      let obj = {
          "test": /\.(ts|tsx)?$/,
          "loader": 'ts-loader',
          "exclude": "/node_modules/"
      };

      npmConfig.dev.push('typescript', 'ts-loader');
      if (config.library === 'react') {
          npmConfig.dev.push('@types/react', '@types/react-dom');
      } else if (config.library === 'vue') {
          obj = {
              "test": /\.(ts|tsx)?$/,
              "loader": "ts-loader",
              "exclude": "/node_modules/",
              "options": {
                  "appendTsSuffixTo": [
                      /\.vue$/
                  ]
              }
          }
      }
      rules.push(obj);

      // change extension to ts if js
      let entrySplit = config.entry.split('.');
      if (entrySplit[entrySplit.length - 1] === 'js')
          entrySplit[entrySplit.length - 1] = 'ts';
      fileConfig.entry = entrySplit.join('.');

    createTypescriptConfig(config);
  }

  // write headers to webpack config
  let string = '';
  headers.map(header => string += header + "\n");
  fs.writeFileSync(PATH_TO_CONFIG, string, 'utf8');

  // append fileConfig to file
  fs.appendFileSync(PATH_TO_CONFIG, "\nconst config = " + util.inspect(fileConfig), 'utf8');

  // write rules to file
  let data = fs.readFileSync(PATH_TO_CONFIG, 'utf8');
  let result = data.replace(/'rules_come_here'/g, util.inspect(rules, { depth: 4 }));
  result = result.replace(/'path_comes_here'/g, `path.resolve(__dirname, '${config.path}')`);
  // write vue loader if library is Vue
  if (config.library === "Vue")
      result = result.replace(/'vue_loader_here'/g, 'new VueLoaderPlugin()');

  fs.writeFileSync(PATH_TO_CONFIG, result, 'utf8');

  // beautify file
  data = fs.readFileSync(PATH_TO_CONFIG, 'utf8');
  let fileData = beautify(data, beautifyConfig);
  fileData = fileData.split('\n');
  fileData = fileData.join('\r\n');
  fileData += '\n\nmodule.exports = config;';
  fs.writeFileSync(PATH_TO_CONFIG, fileData, 'utf8');

  if (config.babel || config.library === 'React' || config.library === 'Vue') {
    createBabelConfig(config.library, config.typescript);
  }

  createEntryFile(config);

  return npmConfig;
}

function createBabelConfig (library, typescript) {
  let config = babelConfigs.default,
    filePath = path.resolve(CONFIG_DIRECTORY, '.babelrc');

  if (library === "React") {
    config = babelConfigs.react;

    if (typescript) {
      config.presets.pop();
    }

  } else if (library === "Vue") {
    config = babelConfigs.vue;
  } else if (library === "Custom config") {
    config = babelConfigs.default;
  }

  fs.writeFileSync(filePath, JSON.stringify(config, null, beautifyConfig.indent_size), 'utf8');
}

function createTypescriptConfig (cliConfig) {
  let library = cliConfig.library,
    tsConfig = tsReactConfig,
    filePath = path.resolve(CONFIG_DIRECTORY, 'tsconfig.json');

  tsConfig.compilerOptions.outDir = resolveRelativePath(cliConfig.path);
  tsConfig.include = [(getEntryFileDirectory(cliConfig)+'/**/*')];

  if (library !== 'React')
    delete tsConfig.compilerOptions.jsx;

  if (library === 'Vue') {
    const shimFilePath = path.resolve(CONFIG_DIRECTORY, 'vue-shim.d.ts');
    let str = "declare module \"*.vue\" {\n\timport Vue from 'vue'\n\texport default Vue\n}";
    fs.writeFileSync(shimFilePath, str, 'utf8');
  }

  fs.writeFileSync(filePath, JSON.stringify(tsConfig, null, beautifyConfig.indent_size), 'utf8');
}

function addStylingRules (styles, rules, npmConfig) {
  let config = starterConfig.styleRules;
  let npmStyleConfig = [];
  if (styles.includes("CSS")) {
    if (styles.includes("CSS Modules")) {
      config.css.exclude = /\.module\.css$/;
    }
    rules.push(config.css);
    npmStyleConfig.push(...['css-loader', 'style-loader']);
  }

  if (styles.includes("CSS Modules")) {
    if (styles.includes("CSS")) {
      config.cssModules.include = /\.module\.css$/;
    }
    rules.push(config.cssModules);
    npmStyleConfig.push(...['css-loader', 'style-loader']);
  }

  if (styles.includes("SASS")) {
    rules.push(config.sass);
    npmStyleConfig.push(...['css-loader', 'style-loader', 'node-sass', 'sass-loader']);
  }

  npmStyleConfig = [...new Set(npmStyleConfig)];
  npmConfig.dev.push(...npmStyleConfig);
}

function imageAndFontLoaders (config, rules, npmConfig) {
  let regex;
  if (config.image) {
    regex = /\.(svg|png|jpg|gif)$/;
  }

  if (config.fonts) {
    if (config.image) {
      regex = /\.(svg|png|jpg|gif|woff|woff2|eot|ttf)$/;
    } else {
      regex = /\.(woff|woff2|eot|ttf)$/;
    }
  }

  if (regex) {
    let imageAndFontRules = starterConfig.imageAndFontRules;
    imageAndFontRules.test = regex;
    npmConfig.dev.push('url-loader');
    rules.push(imageAndFontRules);
  }
}

function addCustomConfigRules (config, rules, npmConfig) {
  if (config.customLoaders.includes("JavaScript") && !config.babel) {
    createBabelConfig(config.library, config.typescript);
  }

  if (config.customLoaders.includes("HTML")) {
    rules.push(starterConfig.htmlRules);
    npmConfig.dev.push('html-loader');
  }
}

function resolveRelativePath (path) {
  if (path.indexOf('/') === 0) {
    return '.' + path;
  }

  if (path.indexOf('./') === 0) {
    return path;
  }

  return './'+path;
}

function getEntryFileDirectory (config) {
  let entryFilePath = resolveRelativePath(config.entry),
    dirPath = '.';

  if (entryFilePath.lastIndexOf('/') === entryFilePath.length - 1) {
    entryFilePath = entryFilePath.slice(0, -1);
  }

  /**
   * /Desktop/project/src/index.js --> /Desktop/project/src
   * ./src/index.js --> ./src
   */

  if (entryFilePath.indexOf('/') === 0 || entryFilePath.indexOf('./') === 0) {
    let arr = entryFilePath.split('/');
    arr.pop();
    dirPath = arr.join('/');
  }

  return dirPath;
}

function createEntryFile (config) {
  const entryFileDir = path.resolve(CONFIG_DIRECTORY, getEntryFileDirectory(config)),
    entryFilePath = path.resolve(CONFIG_DIRECTORY, config.entry);
  if (!fs.existsSync(entryFileDir)) {
    mkdirSync(entryFileDir);
  }
  if (!fs.existsSync(entryFilePath)) {
    fs.writeFileSync(entryFilePath, '', 'utf8');
  }
}

module.exports = createConfig;