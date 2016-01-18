'use strict';

/**
 * @ngdoc function
 * @name gearSpyApp.controller:UserCtrl
 * @description
 * # UserCtrl
 * Controller of the gearSpyApp
 */
angular.module('gearSpyApp')
  .controller('UserCtrl', ['$scope', 'User', "$http", "$rootScope", "$location", function($scope, User, $http, $rootScope, $location) {
    if ($rootScope.athlete === undefined) {
            User.get(function(data) {
                $rootScope.athlete = data.athlete;
            });
    }

    $scope.logout = function() {
        $http.get("http://localhost:8079/inc/GearSpy.php?action=logout").success(function(data) {
            //if (data.status == 401) {
                $scope.retUrl = data.retUrl;
                $rootScope.auth = false;
                $location.path("/");
            //}
        });
    };
}]);
