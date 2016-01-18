'use strict';

/**
 * @ngdoc service
 * @name gearSpyApp.Activity
 * @description
 * # Activity
 * factory in the gearSpyApp.
 */
angular.module('gearSpyApp')
  .factory('Activity', ['$http', '$routeParams', function($http, $routeParams) {
    return {
        id: null,
        get: function(callback) {
            var id = (this.id) ? this.id : $routeParams.activityId;
            $http.get("http://localhost:8079/inc/GearSpy.php?action=activity&id=" + id).success(function(data) {
                callback(data);
            });
        }
    };
}]);
