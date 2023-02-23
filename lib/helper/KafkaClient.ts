import { Kafka as AwsKafka } from "@aws-sdk/client-kafka";
import {
  awsIamAuthenticator,
  Type,
} from "@jm18457/kafkajs-msk-iam-authentication-mechanism";
import { Kafka, Producer } from "kafkajs";

let kafkaProducer: Producer;
export const getKafkaClient = async (topic: string) => {
  if (kafkaProducer) {
    return kafkaProducer;
  }
  const msk = new AwsKafka({});
  const mskCluster = await msk.getBootstrapBrokers({
    ClusterArn: process.env.MSK_CLUSTER_ARN!,
  });
  const brokerUrl = mskCluster.BootstrapBrokerStringSaslIam!;
  const kafka = new Kafka({
    clientId: "my-app",
    brokers: [brokerUrl],
    ssl: true,
    sasl: {
      mechanism: Type,
      authenticationProvider: awsIamAuthenticator(process.env.AWS_REGION!),
    },
  });
  const admin = kafka.admin();
  await admin.connect();
  const topics = await admin.listTopics();
  console.log("Topics: ", topics);

  if (!topics.includes(topic)) {
    await admin.createTopics({
      topics: [{ topic: topic, numPartitions: 1 }],
    });
  }
  await admin.disconnect();

  // publish kafka message to test-topic
  kafkaProducer = kafka.producer();
  await kafkaProducer.connect();
  return kafkaProducer;
};
