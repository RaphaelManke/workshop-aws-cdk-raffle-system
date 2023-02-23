# Chapter 4 - DynamoDB streams
A DynamoDB stream is a powerful feature provided by Amazon DynamoDB that captures a time-ordered sequence of item-level modifications in a table. 
This allows you to set up triggers and respond to changes in your data in real-time. 
With DynamoDB streams, you can build event-driven applications that can efficiently process updates and respond to changes as they occur.

In this quest, you will begin by adding a second Lambda function to the stack.
This new Lambda function will be responsible for processing items added to the DynamoDB table by listening to a DynamoDB stream.

Once the second Lambda function is in place, configure it to be triggered when a new item is added to the DynamoDB table. 
To achieve this, you'll need to set up a DynamoDB stream that sends events to the Lambda function when there's an update in the table. 
This will enable real-time processing of data as it is inserted into the table.

Finally, implement the Lambda function to log the newly added item to the console. 
This will allow you to monitor the data as it is processed and ensure that the system is functioning correctly, providing valuable feedback during the raffle event.

By completing this quest, you will create a powerful event-driven architecture that can respond to changes in the DynamoDB table in real-time. 
This will help ensure a successful raffle event while demonstrating your ability to Sven Serverless, who is closely monitoring your progress.

## Quest

- add a second lambda function to the stack
  - name the handler file `dynamo-stream-handler.ts`
- trigger the new lambda when a new item is added to the dynamodb table
- log the newly added item to the console

## Hints

- [DynamoDB streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html)
- [DynamoDB stream event](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_StreamRecord.html)
- [Enable DynamoDB stream in CDK ](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_dynamodb.Table.html#stream)
- [Dynamo Event source for lambda CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_event_sources.DynamoEventSource.html)
  - Note: filters are optional
- [Allow Lambda read DynamoDB stream read](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_dynamodb.Table.html#grantwbrstreamwbrreadgrantee)

## Solution

<details>
<summary>show solution</summary>

1.  Enable DynamoDB stream on the table in the stack `lib/stack.ts`

    ```typescript
    const table = new Table(this, "RaffleTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      // begin change
      stream: StreamViewType.NEW_AND_OLD_IMAGES,
      // end change
    });
    ```

2.  Add a new lambda function to the stack `lib/stack.ts`

    ```typescript
    const streamHandler = new NodejsFunction(this, "DynamoStreamHandler", {
      runtime: Runtime.NODEJS_18_X,
      entry: "lib/lambda/dynamo-stream-handler.ts",
    });
    ```

3.  Add the DynamoDB stream as an event source to the lambda function

    ```typescript
    streamHandler.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: StartingPosition.TRIM_HORIZON,
      })
    );
    ```

4.  Grant the lambda stream read access to the table

    ```typescript
    table.grantStreamRead(streamHandler);
    ```

5.  Add the lambda function handler code in `lib/lambda/dynamo-stream-handler.ts`

    ```typescript
    export const handler = async (
      dynamoDbStreamEvent: DynamoDBStreamEvent
    ): Promise<void> => {
      dynamoDbStreamEvent.Records.forEach((record) => {
        if (record.eventName == "INSERT" && record.dynamodb?.NewImage) {
          const newImage = record.dynamodb.NewImage as Record<
            string,
            AttributeValue
          >;
          // @ts-ignore
          const unmarshalledNewImage = unmarshall(newImage);
          console.log(JSON.stringify(unmarshalledNewImage));
        }
      });
    };
    ```

</details>
