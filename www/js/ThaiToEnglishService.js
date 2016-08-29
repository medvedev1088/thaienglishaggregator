angular.module('app.services')
    .service('ThaiToEnglishService', ['ThaiToEnglishUrl', function (ThaiToEnglishUrl) {
        var service = {};

        service.getTitle = function () {
            return 'thai2english';
        };

        service.getRequestParams = function (q) {
            return {
                method: 'POST',
                url: ThaiToEnglishUrl + '/ajax/AddNewQueryDoSpacing.aspx',
                params: {
                    unspacedText: q,
                    queryDivId: 'queryText'
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformResponse: [function (data) {
                    return data;
                }]
            }
        };

        service.convertResponseToTranslation = function (data) {
            data = JSON.parse(data);
            console.log(data);

            var translation = {};

            var Query = $(data.Query);
            var transcription = $.makeArray(Query.find('li.listTlitLine > span')).map(function (e) {
                return e.innerText
            }).join(' ');
            translation.tr = transcription;

            var Sentences = data.Sentences;
            var Sentence = Sentences[0];
            var WordObjects = Sentence.WordObjects;
            var words = [];
            for (var i = 0; i < WordObjects.length; i++) {
                var WordObject = WordObjects[i];
                words.push({
                    text: WordObject.Word,
                    tr: WordObject.Transliteration,
                    meaning: stripHtml(WordObject.Meanings[0].Meaning)
                })
            }

            translation.words = words;

            return translation;
        };

        return service;
    }]);
