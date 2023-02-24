# Chapter 7 - DynamoDB update

In this final quest, you will complete the raffle process by storing the outcome for each participant - whether they are a winner or not - in the DynamoDB table. 
You will leverage the Kafka consumer Lambda function to write the results back into the DynamoDB table, ensuring that all raffle information is stored in a single, unified system.

To achieve this, you will need to modify the Kafka consumer Lambda function to update the DynamoDB table with the raffle outcome for each participant. 
You can do this by writing the winner or loser status into the corresponding record in the table, using the participant's unique identifier.

By completing this quest, you will bring the entire raffle system to completion, providing a seamless end-to-end solution that can handle the raffle process from participant registration to winner determination. 
This accomplishment will undoubtedly impress Sven Serverless, who will be thrilled with your performance throughout the workshop. 
In recognition of your outstanding work, Sven will happily offer you a full-time job as a cloud native developer at United Raffle Company Incorporated, providing you with the opportunity to further hone your skills and contribute to the company's success.

## Quest

- update the entry in the dynamodb table if the user is a winner or looser
  - add a new attribute `winner` to the table
  - set the value to `true` if the user is a winner
  - set the value to `false` if the user is a loser
- verify that the table is updated correctly for new items

## Hints

- make sure the lambda function has the correct permissions to update items in the dynamodb table
- the dynamodb sdk client has a `updateItem` method which can be used to update an item in the table
  ```typescript
  const dynamodb = new DynamoDB({});
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
  ```

## Solution

<details>
<summary>show solution</summary>

1. Implement the kafka handler in `lib/lambda/kafka-consumer-handler.ts`

   ```typescript
   const dynamodb = new DynamoDB({});

   export const handler = async (event: MSKEvent) => {
     // loop over all topics
     for (const topic in event.records) {
       // loop over all records in the topic
       for (const record of event.records[topic]) {
         // decode the key and value of the kafka message
         const key = Buffer.from(record.key, "base64").toString("utf-8");
         const value = Buffer.from(record.value, "base64").toString("utf-8");

         // the value is a json string, parse it to an object
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
         // determine if the user is a winner or a loser
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
   ```
2. Grant access to the table
    ```typescript
    table.grantWriteData(kafkaConsumer);
    kafkaConsumer.addEnvironment("TABLE_NAME", table.tableName);
    ```

</details>
