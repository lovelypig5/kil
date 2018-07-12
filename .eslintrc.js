module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 8
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "quotes": [
            "error",
            "double"
        ],
        "no-unused-vars": [0, { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }],
        "space-before-blocks": [1, "always"],
        "space-in-parens": [1, "always"],
        "space-before-function-paren": [1, {
            "anonymous": "never",
            "named": "never",
            "asyncArrow": "always"
        }],
        "arrow-spacing": [1, { "before": true, "after": true }],
        "array-bracket-spacing": [1, "always"],
        "block-spacing": [1, "always"],
        "computed-property-spacing": [1, "always"],
        "comma-spacing": [1, { "before": false, "after": true }],
        "brace-style": [1, "1tbs"],
        "rest-spread-spacing": [1, "always"],
        "space-infix-ops": [1, { "int32Hint": true }],
        "space-unary-ops": [1, {
            "words": true,
            "nonwords": false
        }],
    },
    "globals": {
        "sails": false,
        "console": false,
        "$": false,
        "Vue": false
    }
};
