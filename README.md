# Ya Chat 有聲

學生筆記即時回饋平台

## 檔案架構

```
.
├── README.md
├── aws
│   ├── api - Lambda Function, 處理API Gateway的事件
│   ├── ec2 - 執行EC2的指令
│   ├── s3-worker - 處理S3事件
│   └── transcribe-proxy - 透過Websocket串流轉錄麥克風至Transcribe, 並儲存至S3
├── test
│   └── thunder-collection_YaChat.json - Thunder Client Collection
└── web - React網頁
```

## AWS Services

- S3
- API Gateway
- Lambda
- EC2
- Transcribe
- Comprehend
- CloudFront
- Cognito
