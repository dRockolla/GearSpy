'use strict';

describe('Controller: ActivitylistctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('gearSpyApp'));

  var ActivitylistctrlCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    ActivitylistctrlCtrl = $controller('ActivitylistctrlCtrl', {
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ActivitylistctrlCtrl.awesomeThings.length).toBe(3);
  });
});
