'use strict'

var gearSpyApp = angular.module("gearSpyApp", [
	"gearSpyServices",
	"gearSpyControllers",
	"ngRoute",
	"ui.bootstrap",
	"angulartics",
	"angulartics.google.analytics"
]);

gearSpyApp.config(['$routeProvider', 
	function($routeProvider) {
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
}]);

var checkRouting = function($q, $rootScope, $location) {
	if ($rootScope.athlete) {
		return true;
	} else {
		$location.path('/');
	}
}