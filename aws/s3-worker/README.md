# S3 Worker

A Lambda function that handles S3 events.

## Install

1. Run `npm install`
2. Run `npm run build` to build the dist folder and zip the dist folder
3. Upload the zip file to Lambda
4. Set the `AWS_REGION`, `MONGODB_URI` and `MONGODB_DB` environment variables
5. Set handler to `dist/index.handler`

Upload zip file to Lambda via AWS CLI:

```bash
aws lambda update-function-code --function-name <YOUR_LAMBDA_NAME> --zip-file fileb://s3-worker.zip
```
