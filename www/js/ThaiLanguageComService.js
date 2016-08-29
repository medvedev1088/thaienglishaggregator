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
                params: {
                    xlate: q,
                    format: 'Spiral',
                    gather: 'on',
                    tdx: 8,
                    allowtis620: 'on'
                },
                transformResponse: [function (data) {
                    return data;
                }]
            }
        };

        service.convertResponseToTranslation = function (data) {
            data = eval(data);
            var translation = {};

            translation.t = new Optional(data).get(0).get(0).get(0).orElse('');
            translation.tr = new Optional(data).get(0).get(1).get(3).orElse('');

            translation.sp = new Optional(data).get(1).get(0).get(0).orElse('');

            var dictionary = [];
            new Optional(data).get(1).get(0).get(2).forEach(function (dictEntry) {
                var meaning = dictEntry.get(0).orElse('');
                var synonyms = dictEntry.get(1).orElse('');
                dictionary.push({
                    meaning: meaning,
                    synonyms: synonyms
                })
            });
            translation.dictionary = dictionary;

            return translation;
        };

        return service;
    }]);
