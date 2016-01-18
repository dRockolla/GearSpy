'use strict';

describe('Service: ActivityList', function () {

  // load the service's module
  beforeEach(module('gearSpyApp'));

  // instantiate service
  var ActivityList;
  beforeEach(inject(function (_ActivityList_) {
    ActivityList = _ActivityList_;
  }));

  it('should do something', function () {
    expect(!!ActivityList).toBe(true);
  });

});
