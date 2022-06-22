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
  "fileKeys": ["string"], // File Keys in S3
  "createdAt": "string", // ISO Date
  "textractResults": ["string"] // Textract Results
}
```
