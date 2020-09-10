const User = require('../../../api/models').User;
const Sequelize = require('sequelize');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../server');
let should = chai.should();

const jwt = require('jsonwebtoken');
let token;

chai.use(chaiHttp);

describe('Users', () => {
  before(async () => {
		await User.destroy({
      where: {},
      truncate: { cascade: true }
    })
	});

  let  secretName = process.env.AWS_SECRET_NAME

  describe('AWS infrastucture test', () => {
    it('Add an user and perform all operations', async () => {
      const user = await User.create({username: 'testuser', videoAccess: true, apiAccess: true})
      let response = await user.setPassword('testpassword')
      const expectedResponse =
        {
          SecretId: secretName,
          SecretString: '{"mockedUser":"mockedSalt mockedHash","testuser":"'+user.salt+' '+user.hash+'"}'
        }
      // JSON cast to compare two js objects
      JSON.stringify(response).should.be.eq(JSON.stringify(expectedResponse))
      await user.set('role', 'admin')
      await user.save()

      /*
      Test the password update functionality
       */
      response = await user.setPassword('superGeheimesPassword')
      const expectedResponse2 =
        {
          SecretId: secretName,
          SecretString: '{"mockedUser":"mockedSalt mockedHash","testuser":"'+user.salt+' '+user.hash+'"}'
        }
      // JSON cast to compare two js objects
      JSON.stringify(response).should.be.eq(JSON.stringify(expectedResponse2))
      await user.save()


      /*
      Test rename function without any previous name. This is used for adding users to AWS-Secrets-Manager without
      changing anything in the Heroku DB unlike in setPassword() where the hash and salt are calculated and set again.
      */
      const expectedRenameResponse =
        {
          SecretId: secretName,
          SecretString: '{"testuser":"'+user.salt+' '+user.hash+'","mockedUser":"mockedSalt mockedHash"}'
        }
      let renameResponse = await user.renameAwsUser('')
      renameResponse.should.be.eql(expectedRenameResponse)

      /*
      Test rename function with previous name.
      */
      const expectedRenameResponse2 =
        {
          SecretId: secretName,
          SecretString: '{"updatedTestUser":"'+user.salt+' '+user.hash+'","mockedUser":"mockedSalt mockedHash"}'
        }
      await user.update({'username':'updatedTestUser'})
      await user.save()
      let renameResponse2 = await user.renameAwsUser('testuser')
      JSON.stringify(renameResponse2).should.be.eql(JSON.stringify(expectedRenameResponse2))


      /*
     Test delete function.
     */
      const expectedDeleteResponse =
        {
          SecretId: secretName,
          SecretString: '{"mockedUser":"mockedSalt mockedHash"}'
        }
      let deleteResponse = await user.deleteAwsUser('updatedTestUser')
      JSON.stringify(deleteResponse).should.be.eql(JSON.stringify(expectedDeleteResponse))
    });


    it('Add user an without permissions and return an error', async () => {
      const userWithoutPermissions = await User.create({username: 'testuserWithoutPermissions1', videoAccess: false, apiAccess: false})
      let response = await userWithoutPermissions.setPassword('testpassword')
      // TODO set correct SecretId after logic for multiple environments has been implemented in user.js model.
      const expectedResponse = 'User doesnt have the required permissions.'
      JSON.stringify(response).should.be.eq(JSON.stringify(expectedResponse))
      await userWithoutPermissions.set('role', 'admin')
      await userWithoutPermissions.save()
    });

    it('Add user an without permissions and return an error', async () => {
      const userWithoutPermissions = await User.create({username: 'testuserWithoutPermissions2', videoAccess: true, apiAccess: false})
      let response = await userWithoutPermissions.setPassword('testpassword')
      const expectedResponse = 'User doesnt have the required permissions.'
      JSON.stringify(response).should.be.eq(JSON.stringify(expectedResponse))
      await userWithoutPermissions.set('role', 'admin')
      await userWithoutPermissions.save()
    });

    it('Add user an without permissions and return an error', async () => {
      const userWithoutPermissions = await User.create({username: 'testuserWithoutPermissions3', videoAccess: false, apiAccess: true})
      let response = await userWithoutPermissions.setPassword('testpassword')
      const expectedResponse = 'User doesnt have the required permissions.'
      JSON.stringify(response).should.be.eq(JSON.stringify(expectedResponse))
      await userWithoutPermissions.set('role', 'admin')
      await userWithoutPermissions.save()
    });


  })
});
