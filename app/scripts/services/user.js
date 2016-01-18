'use strict';

/**
 * @ngdoc service
 * @name gearSpyApp.User
 * @description
 * # User
 * Service in the gearSpyApp.
 */
angular.module('gearSpyApp')
  .factory('User', ['$http', function($http) {
    var service = {
        isLoggedIn: false,
        profile: false,

        get: function(callback) {
            $http.get("http://localhost:8079/inc/GearSpy.php?action=auth").success(function(data) {
                callback(data);
            });
        },
        loginUser: function() {
            var q = (window.location.search) ? window.location.search + "&" : "?";
            var url = "http://localhost:8079/inc/GearSpy.php" + q + "action=auth";
            return $http.get(url)
                .then(function(response) {
                    service.isLoggedIn = true;
                    return response;
            });
        }
    };
    return service;
}]);
