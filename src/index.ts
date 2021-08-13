import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";
import * as logs from "@aws-cdk/aws-logs";
import {
  DockerImageAsset,
  DockerImageAssetProps,
} from "@aws-cdk/aws-ecr-assets";
import * as path from "path";

export class ScannedDockerImageAsset extends DockerImageAsset {
  public readonly scanFunction: lambda.SingletonFunction;
  public readonly scanCRHandler: cdk.CustomResource;
  constructor(scope: cdk.Construct, id: string, props: DockerImageAssetProps) {
    super(scope, id, props);

    // Next to the upload of the image we generate a custom resource that handles
    // the returning of the scan results to cloudformation leveraging a lambda function
    // TODO check if the singleton functionality works.
    // This should work by using the lambda SingletonFunction construct
    // else use:
    // function getOrCreate(scope: Construct): sns.Topic {
    // const stack = Stack.of(scope);
    // const uniqueid = 'GloballyUniqueIdForSingleton'; // For example, a UUID from `uuidgen`
    // return stack.node.tryFindChild(uniqueid) as sns.Topic  ?? new sns.Topic(stack, uniqueid);
    //}
    this.scanFunction = new lambda.SingletonFunction(this, `scanFunction`, {
      uuid: "staticuuidforscanningdockerimageassets2e92278ruwu0qu209u",
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.fromAsset(path.join(__dirname, "../function")),
      handler: "scan_handler.main",
      logRetention: logs.RetentionDays.ONE_DAY,
      timeout: cdk.Duration.seconds(890),
    });
    this.scanFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ecr:*", "logs:*"],
        resources: ["*"],
      })
    );

    this.scanCRHandler = new cdk.CustomResource(this, `scanCR`, {
      serviceToken: this.scanFunction.functionArn,
      properties: {
        target: this.imageUri,
        // multiple CRs must be able to call the shared singleton lambda function, so use
        // the cr properties to pass in the imageUri via event['ResourceProperties']['imageUri']
      },
    });

    // The scanCRHandler receives the scanresult from the Lambda function via a pre-signed URL.
    // In the Data property of the response object the scan result is written as a string using the key 'report'.
    new cdk.CfnOutput(this, `scanResultOutput-${id}`, {
      value: this.scanCRHandler.getAtt("report").toString(),
    });
  }
}
