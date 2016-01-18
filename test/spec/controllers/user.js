'use strict';

describe('Controller: UserctrlCtrl', function () {

  // load the controller's module
  beforeEach(module('gearSpyApp'));

  var UserctrlCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    UserctrlCtrl = $controller('UserctrlCtrl', {
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UserctrlCtrl.awesomeThings.length).toBe(3);
  });
});
