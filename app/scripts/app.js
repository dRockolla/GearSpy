'use strict';

/**
 * @ngdoc overview
 * @name gearSpyApp
 * @description
 * # gearSpyApp
 *
 * Main module of the application.
 */

var checkRouting = function($q, $rootScope, $location) {
  if ($rootScope.athlete) {
    return true;
  } else {
    $location.path('/');
  }
};

angular
  .module('gearSpyApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularytics'
  ])
  .config(['$routeProvider', 'AngularyticsProvider', function($routeProvider, AngularyticsProvider) {
  $routeProvider
    .when('/activities/:activityId', {
      templateUrl: 'views/activity.html',
      controller: 'ActivityCtrl',
      resolve: {
        factory: checkRouting
      }
    })
    .when('/activities', {
      templateUrl: 'views/list.html',
      controller: 'ActivityListCtrl',
      reloadOnSearch: false,
      resolve: {
        factory: checkRouting
      }
    })
    .when('/home', {
      templateUrl: 'views/home.html',
      controller: 'HomeCtrl'
    })
    .otherwise({
      redirectTo: '/home'
    });
}]).run(['Angularytics', function(Angularytics) {
  Angularytics.init();
}]);
