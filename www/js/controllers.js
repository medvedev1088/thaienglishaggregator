var controllerFunction = function ($rootScope, $scope, $stateParams, $http, $window, $ionicPopup,
                                   SuggestionsService,
                                   GoogleTranslateService, ThaiToEnglishService, ThaiLanguageComService) {

    var service = null;

    if ($stateParams.tab === 'google') {
        service = GoogleTranslateService;
    } else if ($stateParams.tab === 'thaiToEnglish') {
        service = ThaiToEnglishService;
    } else if ($stateParams.tab === 'thaiLanguageCom') {
        service = ThaiLanguageComService;
    }

    $scope.title = service.getTitle();

    if (!$rootScope.input) {
        $rootScope.input = {
            q: ''
        };
        if (devEnvironment) {
            $rootScope.input.q = 'อาหารไทยมีชื่อเสียงทั่วโลก';
        }
    }
    $scope.translation = {
        t: '',
        tr: '',
        dictionary: [],
        sp: '',
        words: []
    };

    $scope.fullLink = {
        link: ''
    };

    $scope.updateHtml = function () {
        var q = $scope.input.q;

        console.log('search query', q);

        var httpParams = service.getRequestParams(q);

        $http(httpParams).then(function successCallback(response) {
            console.log(response);
            var responseData = response.data;

            var translation;
            try {
                translation = service.convertResponseToTranslation(responseData);
            } catch (err) {
                $ionicPopup.alert({
                    title: err,
                    template: 'test'
                });
            }

            $scope.translation = {
                t: ''
            };

            copyProperties(translation, $scope.translation);

        }, function errorCallback(response) {
            console.log(response);
            $ionicPopup.alert({
                title: 'Error!',
                template: response.data
            });
        });
    };

    $scope.search = function (callback) {
        $scope.updateHtml();
    };

    $scope.getSuggestions = function (query, language) {
        return SuggestionsService.getSuggestions(query, language);
    };
    $scope.$on('$ionicView.enter', function() {
        $scope.updateHtml();
    });
    $scope.ionicGestureCallback = function () {

    }
};


var ctrlParams = [
    '$rootScope', '$scope', '$stateParams', '$http', '$window', '$ionicPopup',
    'SuggestionsService',
    'GoogleTranslateService', 'ThaiToEnglishService', 'ThaiLanguageComService',
    controllerFunction
];
angular.module('app.controllers', [])
    .controller('googleTranslateCtrl', ctrlParams)
    .controller('thaiToEnglishCtrl', ctrlParams)
    .controller('thaiLanguageComCtrl', ctrlParams)

    .controller('cloudTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }]);
