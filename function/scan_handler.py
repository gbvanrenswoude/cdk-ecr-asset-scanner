from logging import getLogger, INFO
import json
import sys
import boto3
import asyncio
import urllib3

http = urllib3.PoolManager()
client = boto3.client('ecr')

logger = getLogger()
logger.setLevel(INFO)


def send(event, context, responseStatus, responseData, physicalResourceId='static_override', noEcho=False, reason=None):
    responseUrl = event['ResponseURL']
    logger.info(
        f'Sending CF response with {responseStatus}')

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

    headers = {
        'content-type': '',
        'content-length': str(len(json_responseBody))
    }

    try:
        response = http.request(
            'PUT', responseUrl, headers=headers, body=json_responseBody)
        logger.info("Succesfully send response")

    except Exception as e:
        logger.error("send(..) failed executing http.request(..):", e)


async def waiter(event, context, target):
    logger.info('Running Lambda function timeout safeguard')
    await asyncio.sleep(870)
    logger.info(
        'Lambda function timeout safeguard triggered, returning SUCCESS with "pass - check later" and ending function.')
    send(event, context, 'SUCCESS', {
        'report': f'Timed out waiting for scan to finish... Continuing deployment. Check scan results when done in the console for target: {target}',
    })
    sys.exit()


async def await_scan_results(registry_id, repository_name, image_digest, image_tag):
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
    logger.info('Found scan entry.')
    while response['imageScanStatus']['status'] == 'IN_PROGRESS':
        await asyncio.sleep(10)
        logger.info('Scan end result is still pending... Retrying in 10s.')
        await await_scan_results(registry_id, repository_name, image_digest, image_tag)
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
    logger.info('Processed all scan findings and findingSeverityCounts.')
    return {
        'findings': finding_list,
        'scan_results': response['imageScanFindings']['findingSeverityCounts'],
        'scan_age': response['imageScanFindings']['imageScanCompletedAt']
    }


def get_image_digest(registry_id, repository_name, image_tag):
    response = client.describe_images(
        registryId=registry_id,
        repositoryName=repository_name,
        imageIds=[
            {
                'imageTag': image_tag
            },
        ]
    )
    return response['imageDetails'][0]['imageDigest']


async def handler(event, context):
    if event['RequestType'] == 'Delete':
        send(event, context, 'SUCCESS', {
            'report': 'no scan result for delete op'
        })
    else:
        try:
            target = event['ResourceProperties']['target']
            asyncio.create_task(waiter(event, context, target))
            logger.info(f'Got CDK DockerImageAsset target: {target}')
            b = target.split('/', 1)
            full_container_id = b[1].split(':', 1)
            container_name = full_container_id[0]
            container_tag = full_container_id[1]
            registry = target[0:12]
            logger.info(
                f'Parsed container target to: name: {container_name}, tag: {container_tag}, registry: {registry}')
            image_digest = get_image_digest(
                registry, container_name, container_tag)
            logger.info(
                f'Fetched image digest: {image_digest}')
            response = await await_scan_results(
                registry, container_name, image_digest, container_tag)
            send(event, context, 'SUCCESS', {
                'report': json.dumps(response['scan_results'])
            })
        except Exception as e:
            logger.error("Generic Error caught: ", e)
            send(event, context, 'SUCCESS', {
                'report': f'CR Handler failed to run, inspect the logs at {context.log_stream_name}',
            })


def main(event, context):
    asyncio.run(handler(event, context))
