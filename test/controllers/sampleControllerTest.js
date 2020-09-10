//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);

describe('sample', () => {
	it('should return true', async () => {
    let trueValue = true

    trueValue.should.be.eql(true);
  });
});
