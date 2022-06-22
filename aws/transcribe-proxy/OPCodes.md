# OP Codes

### `1` CONNECTED

Sent by the server when the client is connected.

```json
{
  "op": 1,
  "msg": "client connected"
}
```

### `2` AUTH

The cognito user token sent by the client.

```json
{
  "op": 2,
  "d": "<COGNITO_TOKEN>"
}
```

### `3` AUTH_SUCCESS

Sent by the server when the client is successfully authenticated.

```json
{
  "op": 3,
  "msg": "auth success"
}
```

### `4` DATA

The base64-encoded audio data sent by the client.

```json
{
  "op": 4,
  "msg": "<base64-encoded audio data>"
}
```

### `5` TRANSCRIPT

The transcript sent by the server.

```json
{
  "op": 5,
  "d": "<TRANSCRIPT>"
}
```

### `41` ANOTHER_CLIENT_CONNECTED

Sent by the server when another client is connected.

```json
{
  "op": 41,
  "msg": "another client connected"
}
```

### `42` AUTH_FAILED

Sent by the server when client authentication fails.

```json
{
  "op": 42,
  "msg": "auth failed"
}
```
