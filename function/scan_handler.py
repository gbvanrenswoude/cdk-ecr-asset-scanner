"""
Environment variables:
    CHANNEL: Slack channel name
    WEBHOOK_URL: Incoming Webhook URL


TODO use cfnresponse, parse input CR await scan parse output scan reply and send to TEAMS

{
  "RequestType": "Create",
  "ResponseURL": "http://pre-signed-S3-url-for-response",
  "StackId": "arn:aws:cloudformation:eu-central-1:123456789012:stack/MyStack/guid",
  "RequestId": "unique id for this create request",
  "ResourceType": "Custom::TestResource",
  "LogicalResourceId": "MyTestResource",
  "ResourceProperties": {
    "StackName": "MyStack",
    "List": [
      "1",
      "2",
      "3"
    ]
  }
}

"""

from datetime import datetime
from logging import getLogger, INFO
import json
import sys
import boto3
import asyncio
import urllib3

http = urllib3.PoolManager()


logger = getLogger()
logger.setLevel(INFO)

# Use urllib3 to send a response to CloudFormation. This way no dependencies need to be packaged


def send(event, context, responseStatus, responseData, physicalResourceId=None, noEcho=False, reason=None):
    responseUrl = event['ResponseURL']

    print(responseUrl)

    responseBody = {
        'Status': responseStatus,
        'Reason': reason or "See the details in CloudWatch Log Stream: {}".format(context.log_stream_name),
        'PhysicalResourceId': physicalResourceId or context.log_stream_name,
        'StackId': event['StackId'],
        'RequestId': event['RequestId'],
        'LogicalResourceId': event['LogicalResourceId'],
        'NoEcho': noEcho,
        'Data': responseData
    }

    json_responseBody = json.dumps(responseBody)

    print("Response body:")
    print(json_responseBody)

    headers = {
        'content-type': '',
        'content-length': str(len(json_responseBody))
    }

    try:
        response = http.request(
            'PUT', responseUrl, headers=headers, body=json_responseBody)
        print("Status code:", response.status)

    except Exception as e:
        print("send(..) failed executing http.request(..):", e)


async def waiter(event, context):
    """
    Prevent Lambda runtime limitation to cock up waiting for scans.
    We could wait using polling (CW Events), but 99,999.... scans are complete within 15 minutes.
    Which would needlessly make this 
    """
    await asyncio.sleep(870)
    send(event, context, 'SUCCESS', {
        'scan_result': 'todo generate ecr url',
        'scan_result_ecr': 'todo generate ecr url'
    })
    sys.exit()


def handler(event, context):
    if event['RequestType'] == 'Delete':
        # When deleting, we can just return a success
        send(event, context, 'SUCCESS', {
            'scan_result': 'no scan result for delete op',
            'scan_result_ecr': 'no scan result for delete op'
        })
    else:
        # An update or create is done on the parameter for the asset. Rescan and return this result
        send(event, context, 'SUCCESS', {})


async def get_scan_results(registry_id, repository_name, image_digest, image_tag):
    client = boto3.client('ecr')
    finding_list = []
    response = client.describe_image_scan_findings(
        registryId=registry_id,
        repositoryName=repository_name,
        imageId={
            'imageDigest': image_digest,
            'imageTag': image_tag
        },
        maxResults=1000
    )
    while response['imageScanStatus']['status'] == 'IN_PROGRESS':
        await asyncio.sleep(30)
        await get_scan_results(registry_id, repository_name, image_digest, image_tag)
    finding_list.append(response['imageScanFindings']['findings'])
    while "nextToken" in response:
        response = client.describe_image_scan_findings(
            registryId=registry_id,
            repositoryName=repository_name,
            imageId={
                'imageDigest': image_digest,
                'imageTag': image_tag
            },
            maxResults=1000,
            nextToken=response["nextToken"]
        )
        finding_list.append(response['imageScanFindings']['findings'])
    return {
        'findings': finding_list,
        'scan_results': response['imageScanFindings']['findingSeverityCounts'],
        'scan_age': response['imageScanFindings']['imageScanCompletedAt']
    }
