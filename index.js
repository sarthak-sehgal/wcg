'use strict';

const inquirer = require('inquirer');
let config = null;
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
            name: 'typescript'
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
                    config = { ...config, ...answers }
                    console.log(config);
                })
        }
    });
