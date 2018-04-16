module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ]
    },
    "globals": {
        "$": true,
        "_": true,
        "Q": true,
        "Rollbar": true,
        "updateBackgroundColorPeriod": true,
        "updateBackgroundColor": true
    }
};
