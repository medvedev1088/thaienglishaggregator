angular.module('app.controllers', [])

    .controller('googleTranslateCtrl', ['$scope', '$stateParams', '$http', '$window',
        function ($scope, $stateParams, $http, $window) {
            $scope.updateHtml = function() {
                $http({
                    method: 'GET',
                    url: 'https://k8kpt9powl.execute-api.ap-southeast-1.amazonaws.com/dev'
                    // headers: {
                    //     'Referer1': 'https://translate.google.com/?source=osdd'
                    // }
                }).then(function successCallback(response) {

                    var json = eval(response.data);

                    $scope.html = json[0][0][0];

                    var iframe = document.getElementById('iframe1');
                    var url = 'https://translate.google.com/?source=osdd#th/en/test';
                    var getData = function (data) {
                        if (data && data.query && data.query.results && data.query.results.resources && data.query.results.resources.content && data.query.results.resources.status == 200) loadHTML(data.query.results.resources.content);
                        else if (data && data.error && data.error.description) loadHTML(data.error.description);
                        else loadHTML('Error: Cannot load ' + url);
                    };
                    var loadURL = function (src) {
                        url = src;
                        var script = document.createElement('script');
                        script.src = 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20data.headers%20where%20url%3D%22' + encodeURIComponent(url) + '%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=getData';
                        document.body.appendChild(script);
                    };
                    var loadHTML = function (html) {
                        iframe.src = 'about:blank';
                        iframe.contentWindow.document.open();
                        iframe.contentWindow.document.write(html.replace(/<head>/i, '<head><base href="' + url + '"><scr' + 'ipt>document.addEventListener("click", function(e) { if(e.target && e.target.nodeName == "A") { e.preventDefault(); parent.loadURL(e.target.href); } });</scr' + 'ipt>'));
                        iframe.contentWindow.document.close();
                    }
                    window.getData = getData;
                    loadURL(url);

                }, function errorCallback(response) {
                    console.log('error');
                    $scope.html = JSON.stringify(response);
                    // $scope.html = response.status;
                    console.log(response);
                });


            }

        }])

    .controller('cartTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }])

    .controller('cloudTabDefaultPageCtrl', ['$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
        function ($scope, $stateParams) {


        }])
