import { APIGatewayProxyResult } from "aws-lambda";

// the exported handler function that is invoked on every request
export const handler = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello World",
    }),
  };
};
