import { EcrAssetScanner } from "./index";
import * as cdk from "@aws-cdk/core";

const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT,
};

const app = new cdk.App();
const stack = new cdk.Stack(app, "test-stack", { env });

new EcrAssetScanner(stack, "test", {
  assetParameter: "pog",
  assetName: "u",
  severity: "NEVER",
});
