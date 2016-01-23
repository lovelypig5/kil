import Mock from 'mockjs';
var url = require('url');

const enableMock = true;
if (enableMock) {
    $.ajaxSetup({
        dataFilter(data, dataType) {
            try {
                return JSON.parse(data);
            } catch (Ex) {
                return data;
            }
        }
    });

    Mock.setup({
        timeout: '200-600',
        responseType: 'json'
    })
    Mock.mock(/\s*^(?!.*hot-update)/, (options) => {
        let _url = url.parse(options.url);
        console.log(`mock request: ${_url.pathname}`);
        if (_url.pathname[0] == '/') {
            _url.pathname = _url.pathname.substring(1);
        }
        var mockData = require('./' + _url.pathname.replace(/\//g, '-') + '.json');
        return Mock.mock(mockData);
    })
}

export default Mock;