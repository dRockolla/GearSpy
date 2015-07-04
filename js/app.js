'use strict'

var gearSpyApp = angular.module("gearSpyApp", [
	"gearSpyServices",
	"gearSpyControllers",
	"ngRoute",
	"ui.bootstrap",
	"angularytics"
]);

gearSpyApp.config(['$routeProvider', 'AngularyticsProvider', function($routeProvider, AngularyticsProvider) {
	$routeProvider
		.when('/activities/:activityId', {
			templateUrl: 'partials/activity.html',
			controller: 'ActivityCtrl',
			resolve: {
				factory: checkRouting
			}
		})
		.when('/activities', {
			templateUrl: 'partials/list.html',
			controller: 'ActivityListCtrl',
			reloadOnSearch: false,
			resolve: {
				factory: checkRouting
			}
		})
		.when('/home', {
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})
		.otherwise({
			redirectTo: '/home'
		});
}]).run(['Angularytics', function(Angularytics) {
	Angularytics.init();
}]);

var checkRouting = function($q, $rootScope, $location) {
	if ($rootScope.athlete) {
		return true;
	} else {
		$location.path('/');
	}
}