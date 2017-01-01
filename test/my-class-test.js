
var chai = require('chai');

var MyClass = require('../src/my-class');

describe('MyClass Test suite::', function () {
    it('sould sum a + b', function () {
        chai.expect(MyClass.test(1, 2)).to.equal(3);
    });
});