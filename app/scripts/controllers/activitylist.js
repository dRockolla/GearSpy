'use strict';

/**
 * @ngdoc function
 * @name gearSpyApp.controller:ActivitylistCtrl
 * @description
 * # ActivitylistCtrl
 * Controller of the gearSpyApp
 */
angular.module('gearSpyApp')
  .controller('ActivityListCtrl', ['$scope', 'ActivityList', '$location', function($scope, ActivityList, $location) {

    if (!$scope.activities) {
        ActivityList.get( function(data) {
            $scope.activities = data;
            //$scope.athlete = data.athlete;
            $scope.auth = true;
        });
        ActivityList.activities = $scope.activities;
    }

    $scope.getActivity = function(id) {
        //$location.path("/activities/" + id)
        $scope.$parent.getActivity(id);
    };
}]);
