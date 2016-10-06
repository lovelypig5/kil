module.exports = {
    "port": 9000,
    "react": false, // use react
    "html5Mode": false,
    "es7": false, // support es7 async, object-rest-spread, flow-strip-types
    "webpack": {
        "output": {
            "*.html": {}
        },
        "commonTrunk": {},
        "global": {},
        "devServer": {
            "proxy": {
                "/test_/?*": "please change or remove this as you need"
            }
        }
    },
    "copy": []
}
