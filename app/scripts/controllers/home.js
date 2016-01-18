'use strict';

/**
 * @ngdoc function
 * @name gearSpyApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the gearSpyApp
 */
angular.module('gearSpyApp')
  .controller('HomeCtrl', ['$scope', '$http', '$location', '$rootScope', function($scope, $http, $location, $rootScope) {
    //angular.element(document).ready(function() {
        var q = (window.location.search) ? window.location.search + "&" : "?";
        var url = "http://localhost:8079/inc/GearSpy.php" + q + "action=auth";
        $http.get(url).success(function(data) {
            if (data.status == 200) {
                if (window.location.search.match("code=")) {
                    window.location = "/";
                }
                $rootScope.auth = true;
                $rootScope.athlete = data.athlete;
            } else {
                $scope.retUrl = data.retUrl;
                $rootScope.auth = false;
                delete $rootScope.athlete;
            }
        })
        .error(function() {
            console.log("Unable to contact server");
        });

        $scope.logout = function() {
            $http.get("http://localhost:8079/inc/GearSpy.php?action=logout").success(function(data) {
                //if (data.status == 401) {
                    $scope.retUrl = data.retUrl;
                    $rootScope.auth = false;
                    delete $rootScope.athlete;
                //}
            });
        };

    //});
}]);
