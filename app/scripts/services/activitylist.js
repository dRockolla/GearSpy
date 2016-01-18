'use strict';

/**
 * @ngdoc service
 * @name gearSpyApp.ActivityList
 * @description
 * # ActivityList
 * Service in the gearSpyApp.
 */
angular.module('gearSpyApp')
  .factory('ActivityList', ['$http', function($http) {
    return {
        activities: null,
        get: function(callback) {
            if (!this.activities) {
                //console.log("calling for activities");
                $http.get("http://localhost:8079/inc/GearSpy.php?action=initui").success(function(data) {
                    callback(data.activities);
                });
            }
        }
    };
}]);
