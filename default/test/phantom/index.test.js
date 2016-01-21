"use strict";
var page = require('webpage').create(),
    t, address;

t = Date.now();
address = 'http://www.baidu.com';
page.open(address, function(status) {
    if (status !== 'success') {
        console.log('FAIL to load the address');
    } else {
        t = Date.now() - t;
        console.log('Page title is ' + page.evaluate(function() {
            return document.title;
        }));
        console.log('Loading time ' + t + ' msec');
    }
    phantom.exit();
});