import { ScannedDockerImageAsset } from "./index";
import { DockerImageAsset } from "@aws-cdk/aws-ecr-assets";
import * as cdk from "@aws-cdk/core";
import * as ecs from "@aws-cdk/aws-ecs";
import * as path from "path";

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const app = new cdk.App();

export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Drop in some Docker Image Asset
    // FIXME type warnings in .fromDockerImageAsset()
    const image = new DockerImageAsset(this, "whoo", {
      directory: path.join(__dirname, "../src/"),
    });
    const image1 = ecs.ContainerImage.fromDockerImageAsset(image);

    // Container Image Asset
    const image2 = ecs.ContainerImage.fromAsset("./src/");

    // Image 3 with scan
    const image3 = new ScannedDockerImageAsset(this, "firsttest", {
      directory: path.join(__dirname, "../src/"),
    });
    const image31 = ecs.ContainerImage.fromDockerImageAsset(image3);
    // Image 4 with scan
    const image4 = new ScannedDockerImageAsset(this, "secondtest", {
      directory: path.join(__dirname, "../src/temp/"),
    });
    const image41 = ecs.ContainerImage.fromDockerImageAsset(image4);

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "test-task-definition",
      {
        memoryLimitMiB: 2048,
        cpu: 1024,
      }
    );
    taskDefinition.addContainer("container", {
      image: image1,
      environment: {
        TEST_VAR: "ONE",
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: "testingone",
      }),
    });
    taskDefinition.addContainer("container_two", {
      // image: ecs.ContainerImage.fromEcrRepository(image1.repository),
      image: image2,
      environment: {
        TEST_VAR: "TWO",
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: "testingtwo",
      }),
    });
    taskDefinition.addContainer("container_three", {
      image: image31,
      environment: {
        TEST_VAR: "THREE",
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: "testingthree",
      }),
    });
    taskDefinition.addContainer("container_four", {
      image: image41,
      environment: {
        TEST_VAR: "FOUR",
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: "testingfour",
      }),
    });
  }
}
new TestStack(app, "test-stack", { env });

// const stack = new TestStack(app, "test-stack", { env });

// Testing outside block scope
// new EcrAssetScanner(stack, "test", {
//   assetParameter: "pog",
//   assetName: "u",
//   severity: "NEVER",
// });
