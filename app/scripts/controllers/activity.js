'use strict';

/**
 * @ngdoc function
 * @name gearSpyApp.controller:ActivityCtrl
 * @description
 * # ActivityCtrl
 * Controller of the gearSpyApp
 */
angular.module('gearSpyApp')
  .controller('ActivityCtrl', ['$scope', '$location', 'Activity', 'Angularytics', function($scope, $location, Activity, Angularytics) {
    Activity.get(function(data) {
        $scope.activityLoaded = true;
        $scope.activity = data.activity;
    });

    $scope.getActivity = function(id) {
        Angularytics.trackEvent('Activity List', 'showRide');
        $scope.id = id;
        Activity.id = id;
        Activity.get(function(data) {
            $scope.activityLoaded = true;
            $scope.activity = data.activity;

        });
    };
}]);
