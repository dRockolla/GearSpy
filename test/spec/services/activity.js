'use strict';

describe('Service: Activity', function () {

  // load the service's module
  beforeEach(module('gearSpyApp'));

  // instantiate service
  var Activity;
  beforeEach(inject(function (_Activity_) {
    Activity = _Activity_;
  }));

  it('should do something', function () {
    expect(!!Activity).toBe(true);
  });

});
