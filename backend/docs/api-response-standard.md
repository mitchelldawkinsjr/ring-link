# API Response Standard (`/api/v1`)

## Success envelope

```json
{
  "data": {},
  "meta": {},
  "message": ""
}
```

## Validation error envelope

```json
{
  "data": null,
  "meta": {
    "errors": {
      "field": ["The field is required."]
    }
  },
  "message": "Validation failed"
}
```

## Pagination envelope

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 200,
      "has_more": true
    }
  },
  "message": ""
}
```
