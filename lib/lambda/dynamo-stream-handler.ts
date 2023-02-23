import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBStreamEvent } from "aws-lambda";
import { getKafkaClient } from "../helper/KafkaClient";

export const TOPIC_NAME = "test-topic";
export const handler = async (dynamoDbStreamEvent: DynamoDBStreamEvent) => {
  const kafka = await getKafkaClient(TOPIC_NAME);

  for (const record of dynamoDbStreamEvent.Records) {
    if (record.eventName == "INSERT" && record.dynamodb?.NewImage) {
      const newImage = record.dynamodb.NewImage as Record<
        string,
        AttributeValue
      >;
      const unmarshalledNewImage = unmarshall(newImage);
      console.log(JSON.stringify(unmarshalledNewImage));

      const sendResp = await kafka.send({
        topic: TOPIC_NAME,
        messages: [
          {
            value: JSON.stringify(unmarshalledNewImage),
            key: unmarshalledNewImage.id,
          },
        ],
      });

      console.log("Send response: ", JSON.stringify(sendResp));
    }
  }
};
