import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBStreamEvent } from "aws-lambda";

export const handler = async (
  dynamoDbStreamEvent: DynamoDBStreamEvent
): Promise<void> => {
  dynamoDbStreamEvent.Records.forEach((record) => {
    if (record.eventName == "INSERT" && record.dynamodb?.NewImage) {
      const newImage = record.dynamodb.NewImage as Record<
        string,
        AttributeValue
      >;
      const unmarshalledNewImage = unmarshall(newImage);
      console.log(JSON.stringify(unmarshalledNewImage));
    }
  });
};
