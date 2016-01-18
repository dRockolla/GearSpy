'use strict';

/**
 * @ngdoc function
 * @name gearSpyApp.controller:GearCtrl
 * @description
 * # GearCtrl
 * Controller of the gearSpyApp
 */
angular.module('gearSpyApp')
  .controller('GearCtrl', ['$scope', '$http', 'GearSpy', 'Angularytics', function($scope, $http, GearSpy, Angularytics) {
    $scope.wheel = 700;
    $scope.spd = 10;
    $scope.options = [
        {"text": "ratio", "value": "ratio"},
        {"text": "Percent Used", "value": "percent"},
        {"text": "gears", "value": "gears"}
    ];
    $scope.mySort = $scope.options[0];
    $scope.showGearForm = false;

    $scope.selectSort = function() {
        GearSpy.reOrder($scope.mySort);
    };

    $scope.spy = function(id) {
        Angularytics.trackEvent('Activity Page', 'spy');
        var params = {
                action: "spy",
                id: id,
                wheel: $scope.wheel,
                speed: $scope.spd,
                chainrings: $scope.chainrings,
                cassette: $scope.cassette
        };
        $http.post("http://localhost:8079/inc/GearSpy.php?action=spy", params).success(function(data) {
            $scope.showGearForm = true;
            GearSpy.sort = $scope.mySort;
            GearSpy.dataset = data;
            $scope.chainrings = data.chainrings.toString();
            $scope.cassette = data.cassette.toString();
            GearSpy.plotSpdCadnc(data.points);
            GearSpy.plotGearPie(data.gears);
            GearSpy.plotClimbing(data.points);
        });
    };

    $scope.spyharder = function(id) {
        var params = {
                action: "spyharder",
                id: id,
                wheel: $scope.wheel,
                speed: $scope.spd,
                chainrings: $scope.chainrings,
                cassette: $scope.cassette
        };
        $http.post("http://localhost:8079/inc/GearSpy.php?action=spyharder", params).success(function(data) {
            $scope.showGearForm = true;
            GearSpy.sort = $scope.mySort;
            GearSpy.dataset = data;
            $scope.chainrings = data.chainrings.toString();
            $scope.cassette = data.cassette.toString();
            GearSpy.plotSpdCadnc(data.points);
            GearSpy.plotGearPie(data.gears);
            //GearSpy.plotClimbing(data.points)
        });
    };

    //$scope.pattern = /^\d\d$|^\d\d\s/;
    //$scope.chainrings = "50 34";
    //$scope.cassette = "12 13 14 15 16 17 19 21 24 27";
}]);
