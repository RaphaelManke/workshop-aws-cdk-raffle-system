# Chapter 5 - Kafka producer

In this quest, you will address a requirement from another team that needs to know about all the raffle participants due to compliance reasons. 
Unfortunately, this team can only consume Kafka events. 
Therefore, you will extend the architecture by setting up a Kafka cluster and publishing all the saved participants as events on a topic in this cluster.

First, you will attach the DynamoDB stream handler as a producer to the Kafka cluster. 
This will enable the Lambda function to send messages to the Kafka cluster. 
Make sure to set the Lambda timeout to 30 seconds, giving the function enough time to process and send the messages without timing out.

Next, you will configure the Lambda function to publish each DynamoDB stream event to the Kafka topic named test-topic. 
This will ensure that the other team has access to all the raffle participant information in a format they can consume.

Finally, implement logging for the response from the Kafka send message call within the Lambda function. This will help you monitor the success of sending messages to the Kafka cluster and provide valuable feedback to ensure a reliable and compliant raffle system.

By completing this quest, you will create a versatile event-driven architecture that satisfies the compliance requirements of the other team and demonstrates your ability to adapt to various system constraints, all under the watchful eye of Sven Serverless.

## Prerequisites

- add and deploy the kafka cluster to the stack
  ```typescript
  const kafkaCluster = new KafkaCluster(this, "KafkaCluster", {});
  ```
  - the deployment will take a while
- add dependencies `kafkajs` and aws sdk client for Kafka
  ```bash
  npm install kafkajs @jm18457/kafkajs-msk-iam-authentication-mechanism @aws-sdk/client-kafka
  ```

## Quest

- attach the dynamodb stream handler as a producer to the kafka cluster
  - set the lambda timeout to 30 seconds
- publish each dynamodb stream event to the kafka topic `test-topic`
- log the response from the kafka send message call

## Hints

- [KafkaJs library](https://kafka.js.org/docs/getting-started)
- the KafkaCluster construct has a `addProducer` method which takes the lambda function props as input and creates a new function which can connect to the cluster.
  ```typescript
  const kafkaCluster = new KafkaCluster(this, "KafkaCluster", {});
  const producer = kafkaCluster.addProducer("KafkaProducerLambda", {
  runtime: Runtime.NODEJS_18_X,
    entry: "lib/lambda/kafka-producer.ts",
  });
  ```
- Send messages with KafkaJs
  ```typescript
  const kafkaProducer = await getKafkaClient();
  await kafkaProducer.send({
    topic: "<name-of-topic>",
    messages: [
      {
        key: "some-key",
        value: JSON.stringify(someObject),
      },
    ],
  });
  ```

## Solution

<details>
<summary>show solution</summary>

1. Create a lambda to publish the dynamodb stream events to the kafka cluster

   ```typescript
   const streamHandler = kafkaCluster.addProducer("DynamoStreamHandler", {
     runtime: Runtime.NODEJS_18_X,
     entry: "lib/lambda/dynamo-stream-handler.ts",
     timeout: Duration.seconds(30),
   });
   ```

2. Refactor the dynamodb stream handler in `lib/lambda/dynamo-stream-handler.ts` to send the dynamodb stream events to the kafka cluster

   ```typescript
   export const handler = async (dynamoDbStreamEvent: DynamoDBStreamEvent) => {
     // get a connection to the kafka cluster
     const kafka = await getKafkaClient(TOPIC_NAME);

     // loop through the dynamodb stream events
     for (const record of dynamoDbStreamEvent.Records) {
       // we are only interested in the INSERT events
       if (record.eventName == "INSERT" && record.dynamodb?.NewImage) {
         const newImage = record.dynamodb.NewImage as Record<
           string,
           AttributeValue
         >;
         // unmarshall the dynamodb stream event to have a proper json object
         const unmarshalledNewImage = unmarshall(newImage);
         console.log(JSON.stringify(unmarshalledNewImage));

         // send the message to the kafka cluster
         const sendResp = await kafka.send({
           topic: TOPIC_NAME,
           messages: [
             {
               value: JSON.stringify(unmarshalledNewImage),
               key: unmarshalledNewImage.id,
             },
           ],
         });
         // log the response from the kafka cluster
         console.log("Send response: ", JSON.stringify(sendResp));
       }
     }
   };
   ```

3. Invoke the Rest endpoint and inspect the logs. The Stream handler should log something like
   ```bash
   Send response:  {"topicName":"test-topic","partition":0,"offset":"0","timestamp":"2021-09-06T13:00:00.000Z"}
   ```

</details>
