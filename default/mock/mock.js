import Mock from 'mockjs';
var url = require('url');

const enableMock = false;

if (enableMock) {
    // if jQuery exists
    if ($) {
        $.ajaxSetup({
            dataFilter(data, dataType) {
                try {
                    return JSON.parse(data);
                } catch (Ex) {
                    return data;
                }
            }
        })
    }

    Mock.setup({
        timeout: '200-600',
        responseType: 'json'
    })
    Mock.mock(/\s*/, (options) => {
        let _url = url.parse(options.url);
        console.log(`request url: ${_url.pathname}`);
        if (_url.pathname.indexOf('hot-update') == -1) {
            if (_url.pathname[0] == '/') {
                _url.pathname = _url.pathname.substring(1);
            }
            var mockData = require('./' + _url.pathname.replace(/\//g, '-') + '.json');
            return Mock.mock(mockData);
        }
    })
}

export default Mock;