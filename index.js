#!/usr/bin/env node
"use strict";

// get command line arguments
const inquirer = require("inquirer"),
  ora = require("ora"),
	createConfig = require("./createConfig"),
  chalk = require("chalk"),
  exec = require('child_process').exec,
  path = require('path'),
  commandLineArgs = require('command-line-args'),
  optionDefinitions = [
    { name: 'output', alias: 'o', type: String, default: './' }
  ],
  options = commandLineArgs(optionDefinitions),
  CONFIG_DIRECTORY = options.output ? path.resolve(process.cwd(), options.output.trim().replace(' ', '-')) : path.resolve(process.cwd());

// initialise spinner
let spinner = ora("Setting up webpack");
spinner.color = "blue";

let config = null;

inquirer
  .prompt([
    {
      type: "list",
      message: "Select main library",
      name: "library",
      choices: [
        {
          name: "React"
        },
        {
          name: "Vue"
        },
        {
          name: "Custom config"
        }
      ],
      validate: function(answer) {
        if (answer.length < 1) {
          return "You must choose at least one library.";
        }
        return true;
      }
		},
		{
			type: "confirm",
			message: "Do you want to transpile using Babel?",
			name: "babel",
			default: true,
			when: function (answers) {
				return answers.library === 'Custom config';
			}
		},
    {
      type: "confirm",
      message: "Are you using Typescript?",
      name: "typescript",
      default: false
    },
    {
      type: "input",
      message: "Entry file",
      name: "entry",
      default: "./src/index.js"
    },
    {
      type: "input",
      message: "Output path",
      name: "path",
      default: "dist"
    },
    {
      type: "input",
      message: "Output file name",
      name: "filename",
      default: "bundle.js"
    },
    {
      type: "checkbox",
      message: "Styling",
      name: "styling",
      choices: [
        {
          name: "CSS"
        },
        {
          name: "CSS Modules"
        },
        {
          name: "SASS"
        }
      ]
    },
    {
      type: "confirm",
      message: "Load images (svg/png/jpg/gif) using webpack?",
      name: "image"
    },
    {
      type: "confirm",
      message: "Load fonts (woff/woff2/eot/ttf) using webpack?",
      name: "fonts"
    },
    {
      type: "list",
      message: "Package manager [ we will install dependencies for you :-) ]",
      name: "packageManager",
      choices: [
        {
          name: "npm"
        },
        {
          name: "yarn"
        }
      ],
      validate: function(answer) {
        if (answer.length < 1) {
          return "You must choose at least one package manager.";
        }
        return true;
      }
		}
  ])
  .then(answers => {
    config = answers;
    if (answers.library === "Custom config") {
      inquirer
        .prompt([
          {
            type: "checkbox",
            message: "Select files to compile",
            name: "customLoaders",
            choices: [
              {
                name: "JavaScript"
              },
              {
                name: "HTML"
              }
            ]
          }
        ])
        .then(answers => {
          config = { ...config, ...answers };
          cliCreateConfig();
        });
    } else {
      cliCreateConfig();
    }
  });

function cliCreateConfig() {
  spinner.start();
  const npmConfig = createConfig(config, CONFIG_DIRECTORY);
  spinner.stop();
  console.log(chalk.green.bold('\n\nConfig created! Installing dependencies...\n\n'));

  spinner = ora("Installing dependencies");
  spinner.color = "blue";
  spinner.start();

  setTimeout(() => {
    spinner.text = "Still installing dependencies...";
    spinner.color = "yellow";
  }, 10000);

  setTimeout(() => {
    spinner.text = "Almost done...";
    spinner.color = "green";
  }, 25000)

  const packageManager = config.packageManager;
  if (packageManager === 'npm') {
    exec(`cd "${CONFIG_DIRECTORY}" && npm init -y && npm i --save-dev ${npmConfig.dev.join(" ")} && npm i --save ${npmConfig.save.join(" ")}`, (err) => {
      spinner.stop();
      if (err) {
        console.log(chalk.red.bold('Failed to install dependencies.\n\n'));
        console.log(err);
        console.log(chalk.yellow(`\n\nPlease run the command "npm i --save-dev ${npmConfig.dev.join(' ')} && npm i --save ${npmConfig.save.join(' ')}" to manually install dependencies.\n\n`));
        return;
      }

      console.log(chalk.green.bold("Dependencies installed. Enjoy! :)\n\n"));
    });
  } else if (packageManager === 'yarn') {
    exec(`cd "${CONFIG_DIRECTORY}" && yarn init -y && yarn add ${npmConfig.dev.join(" ")} --dev && yarn add ${npmConfig.save.join(" ")}`, (err) => {
      spinner.stop();
      if (err) {
        console.log(chalk.red.bold('Failed to install dependencies.\n\n'));
        console.log(err);
        console.log(chalk.yellow(`\n\nPlease run the command "npm i --save-dev ${npmConfig.dev.join(' ')} && npm i --save ${npmConfig.save.join(' ')}" to manually install dependencies.\n\n`));
        return;
      }

      console.log(chalk.green.bold("Dependencies installed. Enjoy! :)\n\n"));
    });
  }
}
