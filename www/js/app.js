// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

function htmlDecode(input){
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

function stripHtml(input) {
    var container = document.createElement('div');
    container.innerHTML = input;
    return container.innerText || container.textContent;
}

function copyProperties(source, dest) {
    for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
            dest[prop] = source[prop];
        }
    }
}

// Optional

function Optional(value) {
    this.value = value;
    this.hasValue = !!value;
}

Optional.prototype.forEach = function(func) {
    if (this.hasValue && this.value.length) {
        for (var i = 0; i < this.value.length; i++) {
            func(new Optional(this.value[i]));
        }
    }
};

Optional.prototype.get = function(index) {
    return this.hasValue && this.value.length && this.value.length > index
        ? new Optional(this.value[index])
        : new Optional(null);
};

Optional.prototype.orElse = function(value) {
    return this.hasValue ? this.value : value;
};

var devEnvironment = localStorage.environment === 'dev';
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives','app.services', 'ion-autocomplete'])
.constant('ThaiToEnglishUrl', devEnvironment ? '': 'http://www.thai2english.com')
.constant('ThaiLanguageComUrl', devEnvironment ? '': 'http://thai-language.com')
.constant('GoogleCompleteSearchUrl', devEnvironment ? '': 'http://suggestqueries.google.com')
    .directive('detectGestures', function($ionicGesture) {
        return {
            restrict :  'A',

            link : function(scope, elem, attrs) {
                var gestureType = attrs.gestureType;
                elem.trigger(gestureType);
                $ionicGesture.on(gestureType, scope.ionicGestureCallback, elem);
            }
        }
    })
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})
