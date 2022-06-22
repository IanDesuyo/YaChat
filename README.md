# Courses

```json
{
  "id": "string", // MongoDB ID
  "name": "string", // Course Name
  "description": "string", // Course Description
  "teacherId": "***REMOVED***", // Cognito username
  "teacherName": "string", // Teacher Name, should update when Cognito username changes
  "createdAt": "string" // ISO Date
}
```

# Lessons

```json
{
  "id": "string", // MongoDB ID
  "courseId": "string", // Course ID
  "name": "string", // Lesson Name
  "description": "string", // Lesson Description
  "createdAt": "string", // ISO Date
  "topics": []
}
```

# StudentNotes

```json
{
  "id": "string", // MongoDB ID
  "lessonId": "string", // Lesson ID
  "nickname": "string", // Student Name
  "createdAt": "string", // ISO Date
  "files": [
    {
      "key": "string", // File Key in S3
      "textractResult": {} // Textract Result
    }
  ],
  "topics": [] // Comprehend Result
}
```
