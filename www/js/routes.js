angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



      .state('tabsController.googleTranslate', {
    url: '/page2?tab',
    views: {
      'tab1': {
        templateUrl: 'templates/tabContent.html',
        controller: 'googleTranslateCtrl'
      }
    }
  })

  .state('tabsController.cartTabDefaultPage', {
    url: '/page3?tab',
    views: {
      'tab2': {
        templateUrl: 'templates/tabContent.html',
        controller: 'cartTabDefaultPageCtrl'
      }
    }
  })

  .state('tabsController.cloudTabDefaultPage', {
    url: '/page4',
    views: {
      'tab3': {
        templateUrl: 'templates/cloudTabDefaultPage.html',
        controller: 'cloudTabDefaultPageCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

$urlRouterProvider.otherwise('/page1/page3?tab=thai2english')



});
