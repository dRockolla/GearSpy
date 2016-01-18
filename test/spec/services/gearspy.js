'use strict';

describe('Service: GearSpy', function () {

  // load the service's module
  beforeEach(module('gearSpyApp'));

  // instantiate service
  var GearSpy;
  beforeEach(inject(function (_GearSpy_) {
    GearSpy = _GearSpy_;
  }));

  it('should do something', function () {
    expect(!!GearSpy).toBe(true);
  });

});
