angular.module('app.controllers', [])

    .controller('googleTranslateCtrl', ['$scope', '$stateParams', '$http', '$window',
        function ($scope, $stateParams, $http, $window) {
            $scope.updateHtml = function() {
                $http({
                    method: 'GET',
                    url: 'https://inputtools.google.com/request?text=ja&itc=th-t-i0-und&num=13&cp=0&cs=1&ie=utf-8&oe=utf-8&app=translate&cb=_callbacks____1ireyntgb',
                    transformResponse: [function (data) {
                        return data;
                    }]
                }).then(function successCallback(response) {

                    // var json = eval(response.data);
                    console.log(response.data);
                    $scope.html = response.data;


                }, function errorCallback(response) {
                    console.log('error');
                    $scope.html = JSON.stringify(response);

                });


            };

            $scope.callbackMethod = function (query, isInitializing) {
                return ['asdf', 'qwer'];
            }

        }])

    .controller('cartTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }])

    .controller('cloudTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }]);
