import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { MSKEvent } from "aws-lambda";
import { randomInt } from "crypto";

const dynamodb = new DynamoDB({});

export const handler = async (event: MSKEvent) => {
  for (const topic in event.records) {
    for (const record of event.records[topic]) {
      const key = Buffer.from(record.key, "base64").toString("utf-8");
      const value = Buffer.from(record.value, "base64").toString("utf-8");
      const valueJson = JSON.parse(value);
      const kafkaMessage = {
        raw: record,
        parsed: {
          key,
          value,
          valueJson,
        },
      };
      console.log(JSON.stringify(kafkaMessage));
      const isWinner = randomInt(2) === 1;
      console.log(`${valueJson.name} is winner: ${isWinner}`);

      await dynamodb.updateItem({
        TableName: process.env.TABLE_NAME!,
        Key: {
          ...marshall({
            id: valueJson.id,
          }),
        },
        UpdateExpression: "set winner = :winner",
        ExpressionAttributeValues: {
          ":winner": {
            BOOL: isWinner,
          },
        },
      });
    }
  }
};
