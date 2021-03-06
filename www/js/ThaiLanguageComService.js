angular.module('app.services')
    .service('ThaiLanguageComService', ['ThaiLanguageComUrl', function (ThaiLanguageComUrl) {
        var $ = angular.element;

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
                    tdx: 20,
                    allowtis620: 'on'
                }),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformResponse: [function (data) {
                    return data;
                }]
            }
        };

        var parseBulk = function(html) {
            var translation = {};

            var MIDDLE_SECTION_ROW_COUNT = 4;
            var BUFFER_AROUND_MIDDLE_SECTION_ROW_COUNT = 1;

            var table = html.find('#old-content table').first();
            var rows = table.find('>tbody>tr');

            var rowCount = table.find('tr').length;
            var wordCount = rowCount - MIDDLE_SECTION_ROW_COUNT - BUFFER_AROUND_MIDDLE_SECTION_ROW_COUNT * 2;
            var wordTopCount = Math.floor(wordCount / 2);

            var wordsRow = rows.eq(wordTopCount + BUFFER_AROUND_MIDDLE_SECTION_ROW_COUNT);
            var transliterationRow = rows.eq(wordTopCount + BUFFER_AROUND_MIDDLE_SECTION_ROW_COUNT + 2);
            var transliterationCells = transliterationRow.find('>td');

            var calcTranslationRowIndex = function(wordIndex) {
                if (wordIndex < wordTopCount) {
                    return wordIndex;
                } else {
                    return MIDDLE_SECTION_ROW_COUNT + BUFFER_AROUND_MIDDLE_SECTION_ROW_COUNT * 2 + wordIndex;
                }
            };

            var words = [];
            wordsRow.find('>td').each(function(wordIndex) {
                var translationRowIndex = calcTranslationRowIndex(wordIndex);
                var translationRow = rows.eq(translationRowIndex);

                var meanings = translationRow.find('>td').last().find('>dl>dd').map(function() {
                    return $(this).text();
                });

                words.push({
                    text: $(this).text(),
                    tr: transliterationCells.eq(wordIndex).html(),
                    meanings: meanings
                })
            });
            translation.words = words;

            translation.t = '';
            translation.tr = '';

            translation.sp = '';

            var dictionary = [];

            translation.dictionary = dictionary;

            return translation;
        };

        var parseDictionary = function(html) {
            var definitionRow = html.find('#old-content > table tr td:contains("definition")').parent();
            var translation = {};

            translation.t = definitionRow.find('td:eq(1)').text();
            translation.tr = '';

            translation.sp = '';

            var dictionary = [];

            translation.dictionary = dictionary;

            return translation;
        };

        service.convertResponseToTranslation = function (data) {
            var html = $(data);

            var isBulk = html.find('#old-content h2:first').text().indexOf('Bulk') !== -1;

            if (isBulk) {
                return parseBulk(html);
            } else {
                return parseDictionary(html);
            }
        };

        return service;
    }]);
