# Chapter 2 - Apigateway

AWS API Gateway is a fully managed service that enables you to create, publish, and maintain APIs for your applications. With API Gateway, you can define RESTful or WebSocket APIs, manage access control, and monitor API usage. 
In this quest, you'll be integrating the API Gateway with your Lambda function to create a scalable and responsive raffle system.

API Gateway can invoke a Lambda function in response to an incoming request, allowing you to create serverless APIs that directly map to your Lambda functions. 
This way, you can build a highly available and cost-effective architecture that can handle large numbers of requests.

Sven Serverless has instructed you to add an API Gateway to your architecture that returns a JSON object with the following structure:
  
  ```json
  {
    "message": "Hello World"
  }
  ```

You need to create a GET endpoint that connects the API Gateway to the Lambda function you created in the previous quest.

Remember to adhere closely to Sven's instructions and confirm that the endpoint functions properly. The raffle system's success and your job security depend on it. You wouldn't be the first person Sven has shown the door to after failing this task, so stay vigilant and focused.

## Prequisites

- Add aws lambda types to the project
  ```bash
  npm install --save-dev @types/aws-lambda
  ```
  This package provide types for the lambda function handler how a lambda function is invoked by the AWS Apigateway service. Relevant types are `APIGatewayProxyEvent` (input for the handler function) and `APIGatewayProxyResult` (response of the lambda function).

## Quest

- Create an API Gateway with a single GET endpoint
- The endpoint should be `/raffle`
- The endpoint should return a JSON object with the following structure
  ```json
  {
    "message": "Hello World"
  }
  ```
- The endpoint should be served by the Lambda function created in the previous chapter
- invoke the endpoint in the browser

## Hints

- [AWS API Gateway Construct](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigateway-readme.html)
- [Lambda response for Apigateway integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-integration-settings-integration-response.html)

## Solution

<details>
<summary>show solution</summary>

1. Add ApiGateway to stack

   ```typescript
   const api = new LambdaRestApi(this, "RaffleApi", {
     handler: lambda,
     proxy: false,
   });

   api.root.addResource("raffle").addMethod("GET");
   ```

2. Refactor Lambda function to return a JSON object that fulfills the requirements of a apigateway response
   ```typescript
   export const handler = async (): Promise<APIGatewayProxyResult> => {
     return {
       statusCode: 200,
       body: JSON.stringify({
         message: "Hello World",
       }),
     };
   };
   ```
3. Invoke the endpoint in the browser
  
   The endpoint is available at `https://<api-id>.execute-api.<region>.amazonaws.com/prod/raffle`.
   
   You can find the api-id in the AWS console under API Gateway -> APIs -> RaffleApi -> Stages -> prod -> Invoke URL.
   
   Or use the url created as output of the CDK deployment.

   The response should be
   ```json
   {
     "message": "Hello World"
   }
   ```


</details>
