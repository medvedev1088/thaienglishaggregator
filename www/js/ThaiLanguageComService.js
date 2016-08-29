angular.module('app.services')
    .service('ThaiLanguageComService', ['ThaiLanguageComUrl', function (ThaiLanguageComUrl) {
        var service = {};

        service.getTitle = function () {
            return 'thai-language.com';
        };

        service.getRequestParams = function (q) {
            return {
                method: 'POST',
                url: ThaiLanguageComUrl + '/default.aspx',
                data: $.param({
                    xlate: q,
                    format: 'Spiral',
                    gather: 'on',
                    tdx: 8,
                    allowtis620: 'on'
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformResponse: [function (data) {
                    return data;
                }]
            }
        };

        service.convertResponseToTranslation = function (data) {
            console.log(data);
            var html = $(data);

            var table = html.find('#old-content table');
            console.log('table', table);
            var rowCount = table.find('tr').length;
            console.log(rowCount);

            var translation = {};

            translation.t = '';
            translation.tr = '';

            translation.sp = '';

            var dictionary = [];

            translation.dictionary = dictionary;

            return translation;
        };

        return service;
    }]);
