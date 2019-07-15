const config = {
  react: {
    "presets": [
      [
        "@babel/preset-env",
        {
          "modules": false
        }
      ],
      '@babel/preset-react'
    ]
  },

  vue: {
    "presets": [
      [
        "@babel/preset-env",
        {
          "modules": false
        }
      ]
    ]
  },

  default: {
    "presets": [
      [
        "@babel/preset-env",
        {
          "modules": false
        }
      ]
    ]
  }
}

module.exports = config;