'use strict';
const inquirer = require('inquirer');
const fs = require('fs');
const ora = require('ora');
const starterConfig = require('./starter');
const path = require('path');
var util = require('util');
const beautify = require('js-beautify').js;

// initialise spinner
const spinner = ora('Setting up webpack');
spinner.color = 'blue';

let config = null;
let npmInstall = [];
let npmInstallSave = [];
let headers = [];
let rules = [];
headers.push("const webpack = require('webpack');");
headers.push("const path = require('path');");

const PATH_TO_CONFIG = path.resolve(__dirname, 'webpack.config.js');

inquirer
    .prompt([
        {
            type: 'list',
            message: 'Select main library',
            name: 'library',
            choices: [
                {
                    name: 'React'
                },
                {
                    name: 'Vue'
                },
                {
                    name: 'Custom config'
                }
            ],
            validate: function (answer) {
                if (answer.length < 1) {
                    return 'You must choose at least one library.';
                }
                return true;
            }
        },
        {
            type: 'confirm',
            message: 'Are you using Typescript?',
            name: 'typescript',
            default: false
        },
        {
            type: 'input',
            message: 'Entry file',
            name: 'entry',
            default: './src/index.js'
        },
        {
            type: 'input',
            message: 'Output path',
            name: 'path',
            default: 'dist'
        },
        {
            type: 'input',
            message: 'Output file name',
            name: 'filename',
            default: 'bundle.js'
        },
        {
            type: 'checkbox',
            message: 'Styling',
            name: 'styling',
            choices: [
                {
                    name: 'CSS'
                },
                {
                    name: 'CSS Modules'
                },
                {
                    name: 'SASS'
                },
                {
                    name: 'LESS'
                },
                {
                    name: 'Stylus'
                }
            ]
        },
        {
            type: 'checkbox',
            message: 'Image loader',
            name: 'image',
            choices: [
                {
                    name: 'SVG'
                },
                {
                    name: 'PNG/JPG/JPEG/GIF'
                }
            ]
        },
        {
            type: 'confirm',
            message: 'Load offline fonts?',
            name: 'fonts'
        },
        {
            type: 'checkbox',
            message: 'Linter',
            name: 'linter',
            choices: [
                {
                    name: 'JavaScript (ESLint)'
                },
                {
                    name: 'HTML'
                }
            ]
        },
    ])
    .then(answers => {
        config = answers;
        if (answers.library === "Custom config") {
            inquirer
                .prompt([
                    {
                        type: 'checkbox',
                        message: 'Select files to compile',
                        name: 'customLoaders',
                        choices: [
                            {
                                name: 'JavaScript'
                            },
                            {
                                name: 'HTML'
                            }
                        ]
                    }
                ])
                .then(answers => {
                    config = { ...config, ...answers };
                    createConfig();
                })
        } else {
            createConfig();
        }
    });


function createConfig() {
    // start spinner
    spinner.start();

    let fileConfig = {};

    // create files corresponding to react, vue or custom config and put in data
    if (config.library === "React") {
        npmInstallSave = ["webpack", "webpack-cli", "babel-loader", "@babel/preset-react", "@babel/core", "@babel/preset-env", "webpack-dev-server"];
        npmInstall = ["react", "react-dom", "react-hot-loader"];
        fileConfig = { ...starterConfig.reactConfig };
        rules = starterConfig.reactRules;

        // delete react-hot-loader if transcript selected
        if (config.typescript) {
            delete fileConfig.devServer;
            npmInstall.pop();
            npmInstallSave.pop();
        }
    } else if (config.library === "Vue") {
        npmInstallSave = ["webpack", "webpack-cli", "vue-loader", "vue-template-compiler", "babel-loader", "@babel/core", "@babel/preset-env"];
        npmInstall = ["vue"];
        fileConfig = { ...starterConfig.vueConfig };
        rules = starterConfig.vueRules;
        headers.push("const VueLoaderPlugin = require('vue-loader/lib/plugin');");
    } else {
        npmInstallSave = ["webpack", "webpack-cli"];
    }

    fileConfig.entry = config.entry;
    fileConfig.output = {
        "path": "path_comes_here",
        "filename": config.filename
    };

    // add transcript loader and make other changed if typescript
    if (config.typescript) {
        fileConfig.resolve.extensions.push('.tsx', '.ts');

        let obj = {
            "test": /\.(ts|tsx)?$/,
            "loader": 'ts-loader',
            "exclude": "/node_modules/"
        };

        npmInstallSave.push('typescript', 'ts-loader');
        if (config.library === 'react') {
            npmInstallSave.push('@types/react', '@types/react-dom');
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
    }

    // write headers to webpack config
    let string = '';
    headers.map(header => string += header + "\n");
    fs.writeFileSync(PATH_TO_CONFIG, string, 'utf8');

    // append fileConfig to file
    fs.appendFileSync(PATH_TO_CONFIG, "\nconst config = " + util.inspect(fileConfig), 'utf8');

    // write rules to file
    let data = fs.readFileSync(PATH_TO_CONFIG, 'utf8');
    let result = data.replace(/'rules_come_here'/g, util.inspect(rules));
    result = result.replace(/'path_comes_here'/g, "path.resolve(__dirname, 'dist')");
    // write vue loader if library is Vue
    if (config.library === "Vue")
        result = result.replace(/'vue_loader_here'/g, 'new VueLoaderPlugin()');
    fs.writeFileSync(PATH_TO_CONFIG, result, 'utf8');

    // beautify file
    data = fs.readFileSync(PATH_TO_CONFIG, 'utf8');
    let fileData = beautify(data, { indent_size: 4, space_in_empty_paren: true });
    fileData = fileData.split('\n');
    fileData = fileData.join('\r\n');
    fs.writeFileSync(PATH_TO_CONFIG, fileData, 'utf8');

    // stop spinner
    spinner.stop();
}