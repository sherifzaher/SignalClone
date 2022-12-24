const aws = require('aws-sdk');
const ddb = new aws.DynamoDB();

const tableName = process.env.USERTABLE;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event, context) =>{

  let now = new Date();
  let date = now.getTime();

  if(event.request.userAttributes.sub){
    const userItem = {
      __typename:{S:"User"},
      _lastChangedAt:{N:date.toString()},
      _version:{N:"1"},
      updatedAt: {S: now.toISOString()},
      createdAt: {S: now.toISOString()},
      id: {S: event.request.userAttributes.sub},
      name: {S: event.request.userAttributes.email},
    };
    let params = {
      Item:userItem,
      TableName:tableName
    };

    try {
      await ddb.putItem(params).promise();
      console.log("Success");
    }catch (err) {
      console.log("Error",err);
    }

    context.done(null,event);

  }else {
    console.log("Error: Nothing was written to DynamoDB");
    context.done(null,event);
  }
};