# Chapter 6 - Kafka consumer

In this quest, you face an unexpected challenge: there has been an emergency in the RaffleWinnerCalculation team, and now you need to take over their winner calculation responsibilities. 
To accomplish this, you will consume the Kafka topic that includes the raffle participants and determine the winners.

First, you will need to set up a new Lambda function to be invoked when a message is published to the Kafka topic. 
This Lambda function will be responsible for processing participant information and determining the raffle winners.

Once the Lambda function is in place, log the incoming message from the Kafka topic to the console. 
This will help you monitor the data and ensure the correct information is being received by the Lambda function.

Next, implement a mechanism within the Lambda function to determine if the user is a winner or a loser. 
You can randomly decide the outcome for each participant, simulating the chance element of the raffle.

Finally, log the result to the console, allowing you to track the winners and losers throughout the raffle event. 
This information will be crucial for the final announcement and distribution of the prizes.

By completing this quest, you will have effectively taken on the responsibilities of the RaffleWinnerCalculation team, demonstrating your adaptability and problem-solving skills in the face of unexpected challenges. 
Sven Serverless will surely be impressed by your ability to handle this emergency situation.

## Quest

- invoke a lambda function when a message is published to the kafka topic `test-topic`
- log the message to the console
- determine if the user is a winner or a loser
  - randomly determine if the user is a winner
- log the result to the console

## Hints

- the KafkaCluster construct has a `addConsumer` method which takes the lambda function props as input and creates a new function which can connect to the cluster.
  ```typescript
  const consumerLambda = new NodejsFunction(this, "KafkaConsumerLambda", {
      entry: "lib/lambda/kafka-consumer-handler.ts",
      runtime: Runtime.NODEJS_18_X,
    });

  kafkaCluster.addConsumer(consumerLambda, <topic-name>);
  ```
- The types for the kafka message are defined in `import { MSKEvent } from "aws-lambda";`

  - The key and value of the kafka message are in BASE64 encoding
  - The base64 string can be decoded with `Buffer.from(<base64 string>, "base64").toString("utf8")`
  - example payload of a Kafka event
    <details>
    <summary>open example payload</summary>

    ```json
    {
      "eventSource": "aws:kafka",
      "eventSourceArn": "arn:aws:kafka:eu-central-1:XXXXXXXXXXXX:cluster/MyServerlessClusterPrivate/204abc61-1e2f-4a5c-bd2e-889893553cfa-s1",
      "bootstrapServers": "boot-xxxxxxx.c1.kafka-serverless.eu-central-1.amazonaws.com:9098",
      "records": {
        "test-topic-0": [
          {
            "topic": "test-topic",
            "partition": 0,
            "offset": 7,
            "timestamp": 1677225002486,
            "timestampType": "CREATE_TIME",
            "key": "YzRjMGQwYTQtYWUxNC00ZTY1LTk3YTctZWQ1NTY2MDZhMmVm",
            "value": "eyJuYW1lIjoiR2VvcmciLCJpZCI6ImM0YzBkMGE0LWFlMTQtNGU2NS05N2E3LWVkNTU2NjA2YTJlZiIsInRpbWVzdGFtcCI6IjIwMjMtMDItMjRUMDc6NDk6NTcuNTc2WiJ9",
            "headers": []
          }
        ]
      }
    }
    ```

    </details>

## Solution

<details>
<summary>show solution</summary>

1. Create a lambda to consume the kafka messages in `lib/stack.ts`

   ```typescript
   const consumerLambda = new NodejsFunction(this, "KafkaConsumerLambda", {
     entry: "lib/lambda/kafka-consumer-handler.ts",
     runtime: Runtime.NODEJS_18_X,
   });
   ```

2. Add the consumer to the kafka cluster in `lib/stack.ts`

   ```typescript
   kafkaCluster.addConsumer(consumerLambda);
   ```

3. Implement the kafka handler in `lib/lambda/kafka-consumer-handler.ts`

   ```typescript
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
       }
     }
   };
   ```

</details>
