'use strict';

describe('Controller: GearctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('gearSpyApp'));

  var GearctrlCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    GearctrlCtrl = $controller('GearctrlCtrl', {
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(GearctrlCtrl.awesomeThings.length).toBe(3);
  });
});
