import {
  DynamoDBClient,
  PutItemCommand,
  PutItemInput,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const dynamodb = new DynamoDBClient({});
  const name = event.queryStringParameters?.name;
  const id = randomUUID();
  const timestamp = new Date().toISOString();
  const params: PutItemInput = {
    TableName: process.env.TABLE_NAME!,
    Item: marshall({
      id,
      name,
      timestamp,
    }),
  };
  const putItemCommand = new PutItemCommand(params);
  await dynamodb.send(putItemCommand);
  return {
    statusCode: 200,
    body: JSON.stringify({
      id,
      name,
      timestamp,
    }),
  };
};
