# small-storage-service

Simple file storage service.

## Usage / Routes

```txt
POST /:collection
# Response on Success: { success: true, url, path }
# Response on Failure: { success: false }
# Response on Failure (File already exists.): { success: false, code: "EEXIST", reason: "~" }
```

```txt
GET /:collection/:hash/:filename
# File server response
```

```txt
DELETE /:collection/:hash/:filename
# Response on Success: { success: true }
# Response on Failure: { success: false }
```

## Docker Hub

mardox/small-storage-service
