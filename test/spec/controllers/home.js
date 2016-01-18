'use strict';

describe('Controller: HomectrlCtrl', function () {

  // load the controller's module
  beforeEach(module('gearSpyApp'));

  var HomectrlCtrl;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    HomectrlCtrl = $controller('HomectrlCtrl', {
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(HomectrlCtrl.awesomeThings.length).toBe(3);
  });
});
