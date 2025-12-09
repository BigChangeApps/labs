openapi: 3.0.1
info:
  title: BigChange.AssetManagement
  description: Asset Management Service
  version: "1"
paths:
  /v1/assets:
    get:
      tags:
        - Assets
      summary: Get a list of assets
      description: Retrieve a paged collection of assets
      operationId: GetAssetsAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: id
          in: query
          description: Only return assets where `id` matches the value(s) provided
          schema:
            type: array
            items:
              type: string
        - name: pageNumber
          in: query
          description: "The page number being requested (minimum: 1, maximum: 1073741)"
          schema:
            maximum: 1073741
            minimum: 1
            type: integer
            format: int32
        - name: pageSize
          in: query
          description: "The page size being requested (minimum: 1, maximum: 2000)"
          schema:
            maximum: 2000
            minimum: 1
            type: integer
            format: int32
        - name: siteId
          in: query
          description: Only return assets where `siteId` matches the value(s) provided
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: categoryId
          in: query
          description: Only return assets where `categoryId` matches the value(s) provided
          schema:
            type: array
            items:
              type: string
        - name: condition
          in: query
          description: Only return assets where `condition` matches the value(s) provided
          schema:
            type: array
            items:
              $ref: "#/components/schemas/AssetCondition"
        - name: status
          in: query
          description: Only return assets where `status` matches the value(s) provided
          schema:
            type: array
            items:
              $ref: "#/components/schemas/AssetStatus"
        - name: modifiedAtFrom
          in: query
          description: The UTC timestamp for filtering assets by modification or creation
            date (whichever is newer)
          schema:
            type: string
            format: date-time
        - name: modifiedAtTo
          in: query
          description: The UTC timestamp for filtering assets by modification or creation
            date (whichever is older)
          schema:
            type: string
            format: date-time
        - name: sortBy
          in: query
          description: The means to sort the results
          schema:
            allOf:
              - $ref: "#/components/schemas/AssetSortOptions"
        - name: direction
          in: query
          description: The direction to apply the sort
          schema:
            allOf:
              - $ref: "#/components/schemas/SortDirection"
        - name: searchText
          in: query
          description: The text to search for in asset ID, reference, or barcode
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadAssetModelPagedResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    post:
      tags:
        - Assets
      summary: Create an asset
      description: Create a new asset
      operationId: CreateAssetAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateAssetModel"
              description: Payload to create an asset
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StringPostResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "409":
          description: Conflict
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/assets/{assetId}:
    get:
      tags:
        - Assets
      summary: Get an asset
      description: Retrieve the details of a single asset
      operationId: GetAssetByIdAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: assetId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadAssetByIdModel"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    patch:
      tags:
        - Assets
      summary: Update an asset
      description: Update the details of a single asset
      operationId: UpdateAssetAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: assetId
          in: path
          description: The unique id of the asset to update
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        description: The update asset payload
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateAssetModel"
              description: Payload to update an asset
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateAssetModel"
              description: Payload to update an asset
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateAssetModel"
              description: Payload to update an asset
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    delete:
      tags:
        - Assets
      summary: Delete an asset
      description: Soft delete the details of a single asset
      operationId: DeleteAssetAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: assetId
          in: path
          description: The unique id of the asset to delete
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/assets/{assetId}/images:
    get:
      tags:
        - Assets
      summary: Get a list of asset images
      description: Retrieve a paged collection asset images
      operationId: GetAssetImagesAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: assetId
          in: path
          description: The unique identifier of the asset
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadAssetImageModelPagedResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    post:
      tags:
        - Assets
      summary: Create an asset image
      description: Create a new asset image
      operationId: CreateAssetImageAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: assetId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateAssetImageModel"
              description: Payload to create an asset image
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StringPostResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/assets/{assetId}/images/{imageId}:
    get:
      tags:
        - Assets
      summary: Get an asset image
      description: Retrieve the details of a single asset image
      operationId: GetAssetImageByIdAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: imageId
          in: path
          required: true
          schema:
            type: string
        - name: assetId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadAssetImageModel"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    delete:
      tags:
        - Assets
      summary: Delete an asset image
      description: Soft delete a specific asset image
      operationId: DeleteAssetImageByIdAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: assetId
          in: path
          required: true
          schema:
            type: string
        - name: imageId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/assets/{assetId}/images/{imageId}/url:
    get:
      tags:
        - Assets
      summary: Get an image URL
      description: Get a URL path for an image to be obtained from
      operationId: GetAssetImagePathAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: assetId
          in: path
          required: true
          schema:
            type: string
        - name: imageId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadAssetImagePathModel"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/assets/countBySite:
    get:
      tags:
        - Assets
      summary: Get the count of assets grouped by site
      description: Retrieve the count of assets grouped by site with pagination
      operationId: GetAssetsCountBySiteAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: assetSiteId
          in: query
          description: List of asset site IDs
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: pageNumber
          in: query
          description: "The page number being requested (minimum: 1, maximum: 21474836)"
          schema:
            maximum: 21474836
            minimum: 1
            type: integer
            format: int32
        - name: pageSize
          in: query
          description: "The page size being requested (minimum: 1, maximum: 100)"
          schema:
            maximum: 100
            minimum: 1
            type: integer
            format: int32
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadAssetsCountBySiteModelPagedResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/assets/search:
    post:
      tags:
        - Assets
      summary: Get a list of assets using POST
      description: Retrieve a paged collection of assets
      operationId: GetAssetsSearchAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/GetAssetsQuery"
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/GetAssetsQuery"
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/GetAssetsQuery"
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadAssetModelPagedResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/assets/validate:
    post:
      tags:
        - Assets
      summary: Validate asset data
      description: Validate asset data without creating a record
      operationId: ValidateAssetAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateAssetModel"
              description: Payload to create an asset
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ValidateAssetResult"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/audit-trails:
    get:
      tags:
        - AuditTrails
      summary: Get a list of audit trails
      description: Retrieve a paged collection of audit trails
      operationId: GetAuditTrailsAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: pageNumber
          in: query
          description: "The page number being requested (minimum: 1, maximum: 21474836)"
          schema:
            maximum: 21474836
            minimum: 1
            type: integer
            format: int32
        - name: pageSize
          in: query
          description: "The page size being requested (minimum: 1, maximum: 100)"
          schema:
            maximum: 100
            minimum: 1
            type: integer
            format: int32
        - name: createdAtFrom
          in: query
          description: The start date for filtering audit trails
          schema:
            type: string
            format: date-time
        - name: createdAtTo
          in: query
          description: The end date for filtering audit trails
          schema:
            type: string
            format: date-time
        - name: createdByUserId
          in: query
          description: The user ID for filtering audit trails
          schema:
            type: integer
            format: int64
        - name: action
          in: query
          description: 'The action for filtering audit trails. Possible values: "Added",
            "Deleted", "Modified"'
          schema:
            type: string
        - name: entityId
          in: query
          description: The entity ID for filtering audit trails
          schema:
            type: string
        - name: entityName
          in: query
          description: 'The entity name for filtering audit trails. Example values:
            "Asset", "Category", "Service", "ServiceAgreement",
            "ServiceAttempt", "ServiceSchedule" ...etc'
          schema:
            type: string
        - name: sortBy
          in: query
          description: The field to sort by
          schema:
            allOf:
              - $ref: "#/components/schemas/AuditTrailsSortOptions"
        - name: direction
          in: query
          description: The direction to apply the sort
          schema:
            allOf:
              - $ref: "#/components/schemas/SortDirection"
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadAuditTrailModelPagedResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/categories:
    get:
      tags:
        - Categories
      summary: Get a list of categories
      description: Retrieve a paged collection of categories
      operationId: GetCategoriesAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: name
          in: query
          description: Only return assets where `name` matches the value provided
          schema:
            type: string
        - name: assetSiteId
          in: query
          description: List of asset site IDs
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: serviceStatus
          in: query
          description: List of service statuses
          schema:
            type: array
            items:
              $ref: "#/components/schemas/ServiceStatus"
        - name: pageNumber
          in: query
          description: "The page number being requested (not yet functional) (minimum: 1,
            maximum: 21474836)"
          schema:
            maximum: 21474836
            minimum: 1
            type: integer
            format: int32
        - name: pageSize
          in: query
          description: "The page size being requested (not yet functional) (minimum: 1,
            maximum: 100)"
          schema:
            maximum: 100
            minimum: 1
            type: integer
            format: int32
        - name: isInProgressServicesExcluded
          in: query
          description: If true, return only categories that have at least one service not
            in progress
          schema:
            type: boolean
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadCategoryModelPagedResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    post:
      tags:
        - Categories
      summary: Create a category
      description: Create a category
      operationId: CreateCategoryAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateCategoryModel"
              description: Payload to create a category
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateCategoryModel"
              description: Payload to create a category
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateCategoryModel"
              description: Payload to create a category
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadCategoryModel"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/categories/{categoryId}:
    get:
      tags:
        - Categories
      summary: Get a category by id
      description: Retrieve a category by id
      operationId: GetCategoryByIdAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: categoryId
          in: path
          description: The unique id of the category to retrieve
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadCategoryModel"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    patch:
      tags:
        - Categories
      summary: Update a category by id
      description: Update a category by id
      operationId: UpdateCategoryAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: categoryId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateCategoryModel"
              description: Payload to update a category
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateCategoryModel"
              description: Payload to update a category
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateCategoryModel"
              description: Payload to update a category
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadCategoryModel"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/filePaths:
    post:
      tags:
        - FilePaths
      summary: Create a file upload path
      description: Create a URL destination for a file to be securely uploaded
      operationId: CreateUploadAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateFilePathModel"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/CreateFilePathResponseModel"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/jobs:
    post:
      tags:
        - Jobs
      summary: Create ServiceJobRequest
      description: Create service jobs request
      operationId: CreateServiceJobRequest
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateServiceJobRequestModel"
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateServiceJobRequestModel"
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateServiceJobRequestModel"
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                type: string
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/jobs/{jobId}:
    get:
      tags:
        - Jobs
      summary: Get ServiceJobRequest by id
      description: Get service jobs request to track the progress of creating jobs
        from due services
      operationId: GetServiceJobAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: jobId
          in: path
          description: ServiceJobRequest id
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/GetServiceJobResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/jobs/preview:
    post:
      tags:
        - Jobs
      summary: Retrieve a list of jobs to create from due services
      description: Retrieve a list of jobs to create from due services
      operationId: PreviewJobsAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/PreviewJobsQuery"
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/PreviewJobsQuery"
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/PreviewJobsQuery"
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/PreviewJobsQueryResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAgreements:
    get:
      tags:
        - ServiceAgreements
      summary: Get a list of service agreements
      description: Retrieve a paged collection of service agreements
      operationId: GetServiceAgreementsAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: id
          in: query
          description: Only return service agreements where `id` matches the value(s)
            provided
          schema:
            type: array
            items:
              type: string
        - name: pageNumber
          in: query
          description: "The page number being requested (minimum: 1, maximum: 21474836)"
          schema:
            maximum: 21474836
            minimum: 1
            type: integer
            format: int32
        - name: pageSize
          in: query
          description: "The page size being requested (minimum: 1, maximum: 100)"
          schema:
            maximum: 100
            minimum: 1
            type: integer
            format: int32
        - name: ownerId
          in: query
          description: The ID of the site that is financially responsible for the agreement
          schema:
            type: integer
            format: int64
        - name: searchText
          in: query
          description: "The text to search for against service agreement Reference\r

            Can be used in conjunction with `SearchSiteId` as an OR condition"
          schema:
            type: string
        - name: searchSiteId
          in: query
          description: "The list of site IDs to search for a service agreement against
            SiteIds or OwnerId\r

            Can be used in conjunction with `SearchText` as an OR condition"
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceAgreementModel"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    post:
      tags:
        - ServiceAgreements
      summary: Create a service agreement
      description: Create a new service agreement
      operationId: CreateServiceAgreementAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateServiceAgreementModel"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StringPostResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAgreements/{serviceAgreementId}:
    get:
      tags:
        - ServiceAgreements
      summary: Get a service agreement
      description: Retrieve the details of a single service agreement
      operationId: GetServiceAgreementByIdAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceAgreementModel"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    patch:
      tags:
        - ServiceAgreements
      summary: Update a service agreement
      description: Update the details of a single service agreement
      operationId: UpdateServiceAgreementAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          description: The unique id of the service agreement to update
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        description: The update service agreement payload
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateServiceAgreementModel"
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateServiceAgreementModel"
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateServiceAgreementModel"
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    delete:
      tags:
        - ServiceAgreements
      summary: Delete a service agreement
      description: Soft delete the details of a single service agreement
      operationId: DeleteServiceAgreementAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          description: The unique id of the service agreement to delete
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAgreements/{serviceAgreementId}/activate:
    put:
      tags:
        - ServiceAgreements
      summary: Activate a service agreement
      description: Activate a service agreement
      operationId: ActivateServiceAgreementAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          description: The unique id of the service agreement to update
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAgreements/{serviceAgreementId}/end:
    patch:
      tags:
        - ServiceAgreements
      summary: End a service agreement by setting the effectiveEndAt date to the
        provided date, and apply a status of 'ended'
      description: Activate a service agreement
      operationId: EndServiceAgreementAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          description: The unique id of the service agreement to update
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        description: The end service agreement payload
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/EndServiceAgreementModel"
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/EndServiceAgreementModel"
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/EndServiceAgreementModel"
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAgreements/{serviceAgreementId}/schedules:
    get:
      tags:
        - ServiceAgreements
      summary: Get a list of service schedules
      description: Retrieve a paged collection of service schedules for a service agreement
      operationId: GetServiceSchedulesAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          description: The unique id of the service agreement
          required: true
          schema:
            type: string
        - name: pageNumber
          in: query
          description: "The page number being requested (minimum: 1, maximum: 21474836)"
          schema:
            maximum: 21474836
            minimum: 1
            type: integer
            format: int32
        - name: pageSize
          in: query
          description: "The page size being requested (minimum: 1, maximum: 100)"
          schema:
            maximum: 100
            minimum: 1
            type: integer
            format: int32
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceScheduleModelPagedResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    post:
      tags:
        - ServiceAgreements
      summary: Create a service schedule
      description: Add new a service schedule to a service agreement
      operationId: CreateServiceScheduleAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateServiceScheduleModel"
              description: Payload to create a service schedule
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StringPostResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAgreements/{serviceAgreementId}/schedules/{serviceScheduleId}:
    get:
      tags:
        - ServiceAgreements
      summary: Get a service schedule
      description: Retrieve the details of a single service schedule
      operationId: GetServiceScheduleByIdAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          description: The unique id of the service agreement
          required: true
          schema:
            type: string
        - name: serviceScheduleId
          in: path
          description: The unique id of the service schedule
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceScheduleModelPagedResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    patch:
      tags:
        - ServiceAgreements
      summary: Update a service schedule
      description: Update the details of a service schedule
      operationId: UpdateServiceScheduleAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          required: true
          schema:
            type: string
        - name: serviceScheduleId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateServiceScheduleModel"
              description: Payload to update a service schedule
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    delete:
      tags:
        - ServiceAgreements
      summary: Delete a service schedule
      description: Soft delete a service schedule
      operationId: DeleteServiceScheduleAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          description: The unique id of the service agreement
          required: true
          schema:
            type: string
        - name: serviceScheduleId
          in: path
          description: The unique id of the service schedule
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAgreements/{serviceAgreementId}/servicePlanner:
    get:
      tags:
        - ServiceAgreements
      summary: Get the service count broken down by ISO week, for each site, for a
        given service agreement and year
      description: Retrieve a collection of ISO weeks for a year with service counts
        per site, based on service agreement
      operationId: GetServiceAgreementPlannerAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          description: The unique id of the service agreement to retrieve.
          required: true
          schema:
            type: string
        - name: year
          in: query
          description: "The year to get the service planner for.\r

            Defaults to the current year if not provided."
          schema:
            type: integer
            format: int32
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/GetServiceAgreementPlannerQueryResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAgreements/{serviceAgreementId}/services:
    get:
      tags:
        - ServiceAgreements
      summary: Get a list of services by service agreement id
      description: Retrieve a paged collection of services for a service agreement
      operationId: GetServicesByAgreementAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: path
          description: The unique id of the service agreement
          required: true
          schema:
            type: string
        - name: pageNumber
          in: query
          description: "The page number being requested (minimum: 1, maximum: 21474836)"
          schema:
            maximum: 21474836
            minimum: 1
            type: integer
            format: int32
        - name: pageSize
          in: query
          description: "The page size being requested (minimum: 1, maximum: 100)"
          schema:
            maximum: 100
            minimum: 1
            type: integer
            format: int32
        - name: dueAtFrom
          in: query
          description: The start date for filtering services due
          schema:
            type: string
            format: date
        - name: dueAtTo
          in: query
          description: The end date for filtering services due
          schema:
            type: string
            format: date
        - name: completedAtFrom
          in: query
          description: The start date for filtering services completed
          schema:
            type: string
            format: date-time
        - name: completedAtTo
          in: query
          description: The end date for filtering services completed
          schema:
            type: string
            format: date-time
        - name: sortBy
          in: query
          description: The field to sort by
          schema:
            allOf:
              - $ref: "#/components/schemas/ServicesSortOptions"
        - name: direction
          in: query
          description: The direction to apply the sort
          schema:
            allOf:
              - $ref: "#/components/schemas/SortDirection"
        - name: searchText
          in: query
          description: The text to search for in asset ID, reference, or barcode
          schema:
            type: string
        - name: isInProgress
          in: query
          description: The flag to indicate if the service has attempts in progress
          schema:
            type: boolean
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceModelPagedResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAttempts:
    get:
      tags:
        - ServiceAttempts
      summary: Get a list of service attempts
      description: Retrieve a paged collection of service attempts
      operationId: GetServiceAttemptsAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: pageNumber
          in: query
          description: "The page number being requested (minimum: 1, maximum: 21474836)"
          schema:
            maximum: 21474836
            minimum: 1
            type: integer
            format: int32
        - name: pageSize
          in: query
          description: "The page size being requested (minimum: 1, maximum: 100)"
          schema:
            maximum: 100
            minimum: 1
            type: integer
            format: int32
        - name: serviceId
          in: query
          description: The unique id of the service
          schema:
            type: string
        - name: jobIds
          in: query
          description: The list of job IDs
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: assetSiteIds
          in: query
          description: The list of asset site ids
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: modifiedAtFrom
          in: query
          description: The UTC timestamp for filtering services attempts by modification
            or creation date (whichever is newer)
          schema:
            type: string
            format: date-time
        - name: modifiedAtTo
          in: query
          description: The UTC timestamp for filtering service attempts by modification or
            creation date (whichever is older)
          schema:
            type: string
            format: date-time
        - name: sortBy
          in: query
          description: List of sorting options
          schema:
            allOf:
              - $ref: "#/components/schemas/ServiceAttemptsSortOptions"
        - name: direction
          in: query
          description: The direction to apply the sort
          schema:
            allOf:
              - $ref: "#/components/schemas/SortDirection"
        - name: includeAssetImage
          in: query
          description: Include the latest asset image url
          schema:
            type: boolean
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceAttemptModelPagedResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    post:
      tags:
        - ServiceAttempts
      summary: Create a service attempt
      description: Create a new service attempt
      operationId: CreateServiceAttemptAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/CreateServiceAttemptModel"
              description: Payload to create a service attempt
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/StringPostResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    delete:
      tags:
        - ServiceAttempts
      summary: Delete service attempts by JobIds
      description: Delete service attempts by job ids
      operationId: DeleteServiceAttemptsByJobIdsAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: jobId
          in: query
          description: List of job ids used retrieve service attempts to delete.
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "204":
          description: No Content
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAttempts/{serviceAttemptId}:
    get:
      tags:
        - ServiceAttempts
      summary: Get a service attempt by id
      description: Retrieve the details of a single service attempt
      operationId: GetServiceAttemptByIdAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAttemptId
          in: path
          description: The unique id of the service attempt to retrieve
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceAttemptModel"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    patch:
      tags:
        - ServiceAttempts
      summary: Update a service attempt
      description: Update the details of a service attempt
      operationId: UpdateServiceAttemptAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAttemptId
          in: path
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/UpdateServiceAttemptModel"
              description: Payload to update a service attempt
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ValidationProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
    delete:
      tags:
        - ServiceAttempts
      summary: Delete a service attempt
      description: Soft delete the details of a single service attempt
      operationId: DeleteServiceAttemptAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAttemptId
          in: path
          description: The unique id of the service attempt to delete
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/serviceAttempts/search:
    post:
      tags:
        - ServiceAttempts
      summary: Get a list of service attempts using POST
      description: Retrieve a paged collection of service attempts
      operationId: GetServiceAttemptsSearchAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/GetServiceAttemptsQuery"
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/GetServiceAttemptsQuery"
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/GetServiceAttemptsQuery"
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceAttemptModelPagedResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/services:
    get:
      tags:
        - Services
      summary: Get a list of services
      description: Retrieve a paged collection of services
      operationId: GetServicesAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: pageNumber
          in: query
          description: "The page number being requested (minimum: 1, maximum: 21474836)"
          schema:
            maximum: 21474836
            minimum: 1
            type: integer
            format: int32
        - name: pageSize
          in: query
          description: "The page size being requested (minimum: 1, maximum: 100)"
          schema:
            maximum: 100
            minimum: 1
            type: integer
            format: int32
        - name: serviceAgreementId
          in: query
          description: The service agreement ID
          schema:
            type: string
        - name: assetSiteIds
          in: query
          description: The list of asset site IDs
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: scheduleIds
          in: query
          description: The list of schedule IDs
          schema:
            type: array
            items:
              type: string
        - name: categoryIds
          in: query
          description: The list of category IDs
          schema:
            type: array
            items:
              type: string
        - name: jobIds
          in: query
          description: The list of job IDs
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: dueAtFrom
          in: query
          description: The start date for filtering services due
          schema:
            type: string
            format: date
        - name: dueAtTo
          in: query
          description: The end date for filtering services due
          schema:
            type: string
            format: date
        - name: modifiedAtFrom
          in: query
          description: The UTC timestamp for filtering services by modification or
            creation date (whichever is newer)
          schema:
            type: string
            format: date-time
        - name: modifiedAtTo
          in: query
          description: The UTC timestamp for filtering services by modification or
            creation date (whichever is older)
          schema:
            type: string
            format: date-time
        - name: completedAtFrom
          in: query
          description: The start date for filtering services completed
          schema:
            type: string
            format: date-time
        - name: completedAtTo
          in: query
          description: The end date for filtering services completed
          schema:
            type: string
            format: date-time
        - name: scheduledAtFrom
          in: query
          description: The start date for filtering services scheduled
          schema:
            type: string
            format: date-time
        - name: scheduledAtTo
          in: query
          description: The end date for filtering services scxheduled
          schema:
            type: string
            format: date-time
        - name: searchText
          in: query
          description: The text to search for in asset ID, reference, or barcode
          schema:
            type: string
        - name: status
          in: query
          description: List of statuses to filter by
          schema:
            type: array
            items:
              $ref: "#/components/schemas/ServiceStatus"
        - name: sortBy
          in: query
          description: The field to sort by
          schema:
            allOf:
              - $ref: "#/components/schemas/ServicesSortOptions"
        - name: direction
          in: query
          description: The direction to apply the sort
          schema:
            allOf:
              - $ref: "#/components/schemas/SortDirection"
        - name: isInProgress
          in: query
          description: The flag to indicate if the service has attempts in progress
          schema:
            type: boolean
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceModelPagedResponse"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/services/{serviceId}/cancel:
    patch:
      tags:
        - Services
      summary: Cancel an individual service
      description: Cancel a service
      operationId: CancelServiceAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceId
          in: path
          description: The unique id of the service to cancel
          required: true
          schema:
            type: string
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "204":
          description: No Content
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/services/csv:
    get:
      tags:
        - Services
      summary: Get a csv of services
      description: Retrieve a CSV containing service data
      operationId: GetServicesCsvAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: serviceAgreementId
          in: query
          description: The service agreement ID
          schema:
            type: string
        - name: assetSiteIds
          in: query
          description: The list of asset site IDs
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: scheduleIds
          in: query
          description: The list of schedule IDs
          schema:
            type: array
            items:
              type: string
        - name: categoryIds
          in: query
          description: The list of category IDs
          schema:
            type: array
            items:
              type: string
        - name: jobIds
          in: query
          description: The list of job IDs
          schema:
            type: array
            items:
              type: integer
              format: int64
        - name: dueAtFrom
          in: query
          description: The start date for filtering services due
          schema:
            type: string
            format: date
        - name: dueAtTo
          in: query
          description: The end date for filtering services due
          schema:
            type: string
            format: date
        - name: modifiedAtFrom
          in: query
          description: The UTC timestamp for filtering services by modification or
            creation date (whichever is newer)
          schema:
            type: string
            format: date-time
        - name: modifiedAtTo
          in: query
          description: The UTC timestamp for filtering services by modification or
            creation date (whichever is older)
          schema:
            type: string
            format: date-time
        - name: completedAtFrom
          in: query
          description: The start date for filtering services completed
          schema:
            type: string
            format: date-time
        - name: completedAtTo
          in: query
          description: The end date for filtering services completed
          schema:
            type: string
            format: date-time
        - name: scheduledAtFrom
          in: query
          description: The start date for filtering services scheduled
          schema:
            type: string
            format: date-time
        - name: scheduledAtTo
          in: query
          description: The end date for filtering services scheduled
          schema:
            type: string
            format: date-time
        - name: searchText
          in: query
          description: The text to search for in asset ID, reference, or barcode
          schema:
            type: string
        - name: status
          in: query
          description: List of statuses to filter by
          schema:
            type: array
            items:
              $ref: "#/components/schemas/ServiceStatus"
        - name: sortBy
          in: query
          description: The field to sort by
          schema:
            allOf:
              - $ref: "#/components/schemas/ServicesSortOptions"
        - name: direction
          in: query
          description: The direction to apply the sort
          schema:
            allOf:
              - $ref: "#/components/schemas/SortDirection"
        - name: isInProgress
          in: query
          description: The flag to indicate if the service has attempts in progress
          schema:
            type: boolean
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      responses:
        "200":
          description: OK
          content:
            text/csv:
              schema:
                type: string
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
  /v1/services/search:
    post:
      tags:
        - Services
      summary: Get a list of services using POST
      description: Retrieve a paged collection of services
      operationId: GetServicesSearchAsync
      parameters:
        - name: User-Id
          in: header
          description: The user identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Id
          in: header
          description: The customer identifier
          required: true
          schema:
            type: integer
            format: int64
        - name: Customer-Name
          in: header
          description: The customer name (optional)
          schema:
            type: string
      requestBody:
        content:
          application/json-patch+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/GetServicesQuery"
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/GetServicesQuery"
          application/*+json:
            schema:
              allOf:
                - $ref: "#/components/schemas/GetServicesQuery"
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ReadServiceModelPagedResponse"
        "400":
          description: Bad Request
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "403":
          description: Forbidden
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "404":
          description: Not Found
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "422":
          description: Unprocessable Content
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
        "500":
          description: Internal Server Error
          content:
            application/problem+json:
              schema:
                $ref: "#/components/schemas/ProblemDetails"
components:
  schemas:
    AssetCondition:
      enum:
        - unknown
        - red
        - amber
        - green
      type: string
      example: unknown
    AssetModel:
      type: object
      properties:
        id:
          type: string
          description: The unique identifier of the asset
        displayId:
          type: string
          description: The display ID of the asset
        reference:
          type: string
          description: The reference of the asset
        name:
          type: string
          description: Represent Asset Display Name and Asset Reference
          readOnly: true
        weeks:
          type: array
          items:
            $ref: "#/components/schemas/WeekModel"
          description: The array of weeks containing service counts for the category
      additionalProperties: false
    AssetSortOptions:
      enum:
        - assetModifiedDate
        - assetCreationDate
      type: string
      description: Shows the possible values for sorting assets
      example: assetModifiedDate
    AssetStatus:
      enum:
        - inactive
        - active
      type: string
      example: inactive
    AuditTrailsSortOptions:
      enum:
        - auditTrailCreationDate
      type: string
      description: Shows the possible values for sorting audit trails
      example: auditTrailCreationDate
    CategoryModel:
      type: object
      properties:
        id:
          type: string
          description: The unique identifier of the category
        name:
          type: string
          description: The name of the category
        weeks:
          type: array
          items:
            $ref: "#/components/schemas/WeekModel"
          description: The array of weeks containing service counts for the category
        assets:
          type: array
          items:
            $ref: "#/components/schemas/AssetModel"
          description: The array of assets containing service counts for each asset
      additionalProperties: false
    CreateAssetImageModel:
      type: object
      properties:
        id:
          type: string
          description: The optional unique identifier for the asset image
        fileName:
          type: string
          description: The filename of the asset physical file (should already be uploaded)
          example: example-image.jpg
      additionalProperties: false
      description: Payload to create an asset image
    CreateAssetModel:
      required:
        - categoryId
        - siteId
      type: object
      properties:
        id:
          type: string
          description: The optional unique identifier for the asset
          nullable: true
        siteId:
          type: integer
          description: The unique identifier of the site where the asset is located
          format: int64
        categoryId:
          minLength: 1
          type: string
          description: The id of the category that this asset is assigned to
        manufacturerSerialNumber:
          type: string
          description: The manufacturerSerialNumber of the asset
          nullable: true
        condition:
          allOf:
            - $ref: "#/components/schemas/AssetCondition"
          description: The condition of the asset
        status:
          allOf:
            - $ref: "#/components/schemas/AssetStatus"
          description: The status of the asset
        reference:
          type: string
          description: The reference of the asset
          nullable: true
        location:
          type: string
          description: The location of the asset
          nullable: true
        barcode:
          type: string
          description: The barcode of the asset
          nullable: true
        manufacturer:
          type: string
          description: The manufacturer of the asset
          nullable: true
        model:
          type: string
          description: The model of the asset
          nullable: true
        manufacturedAt:
          type: string
          description: The date that the asset was originally manufactured
          format: date
          nullable: true
        installedAt:
          type: string
          description: The date that the asset was installed at the site
          format: date
          nullable: true
        lastServiceAt:
          type: string
          description: The date that the asset was last serviced
          format: date
          nullable: true
        warrantyExpiresAt:
          type: string
          description: The date that the asset warranty expires
          format: date
          nullable: true
        endOfLifeAt:
          type: string
          description: The date that the asset is considered end of life
          format: date
          nullable: true
      additionalProperties: false
      description: Payload to create an asset
    CreateCategoryModel:
      required:
        - name
      type: object
      properties:
        name:
          minLength: 1
          type: string
          description: The name of the category
      additionalProperties: false
      description: Payload to create a category
    CreateFilePathModel:
      type: object
      properties:
        fileName:
          type: string
          description: The name of the file to upload
        entityId:
          type: string
          description: The unique identifier of the entity to which the file will be
            associated
        entityType:
          allOf:
            - $ref: "#/components/schemas/FileEntityType"
          description: The type of entity to which the file will be associated
      additionalProperties: false
    CreateFilePathResponseModel:
      type: object
      properties:
        path:
          type: string
          description: The path to upload the file to
        expirationAt:
          type: string
          description: The UTC timestamp of when the Url will expire
          format: date-time
      additionalProperties: false
      description: Represents a response for a POST request, containing the ID of the
        newly created record
    CreateServiceAgreementModel:
      required:
        - ownerId
      type: object
      properties:
        ownerId:
          type: integer
          description: Id of the contact that is financially responsible for the agreement
          format: int64
        siteIds:
          type: array
          items:
            type: integer
            format: int64
          description: The list of site IDs associated with the service agreement
          nullable: true
        reference:
          type: string
          description: The reference of the service agreement
          nullable: true
        startAt:
          type: string
          description: The start date of the service agreement
          format: date
        endAt:
          type: string
          description: The end date of the service agreement
          format: date
        status:
          allOf:
            - $ref: "#/components/schemas/ServiceAgreementStatus"
          description: The status of the service agreement
      additionalProperties: false
    CreateServiceAttemptModel:
      required:
        - attemptAtDate
        - serviceId
        - status
      type: object
      properties:
        id:
          type: string
          description: The optional unique identifier for the service attempt
        serviceId:
          minLength: 1
          type: string
          description: The unique identifier of the service
        status:
          allOf:
            - $ref: "#/components/schemas/ServiceAttemptStatus"
          description: The status of the service attempt
        reason:
          allOf:
            - $ref: "#/components/schemas/ServiceAttemptReason"
          description: The reason of the service attempt (optional)
          nullable: true
        notes:
          type: string
          description: The notes associated with the service attempt (optional)
        attemptAtDate:
          type: string
          description: The date of the attempt
          format: date
        attemptAtTime:
          type: string
          description: "The time of the attempt (optional - format: 15:30:00)"
          format: time
          nullable: true
        jobId:
          type: integer
          description: The unique identifier of the job
          format: int64
          nullable: true
        resourceId:
          type: integer
          description: The unique identifier of the resource
          format: int64
          nullable: true
        taskIds:
          type: array
          items:
            type: string
          description: Task IDs for the service attempt (optional)
          nullable: true
      additionalProperties: false
      description: Payload to create a service attempt
    CreateServiceJobRequestModel:
      type: object
      properties:
        serviceIds:
          type: array
          items:
            type: string
          description: Array of services ids represent services to create jobs against
      additionalProperties: false
    CreateServiceScheduleModel:
      required:
        - assetIds
        - categoryId
        - defaultDuration
        - interval
        - name
        - recurrenceFrequency
      type: object
      properties:
        name:
          minLength: 1
          type: string
          description: The name of the schedule
        defaultDuration:
          type: integer
          description: The duration in minutes that a service of this type is estimated to
            take
          format: int32
        categoryId:
          minLength: 1
          type: string
          description: The unique id of the category of assets that this service schedule
            operates upon
        recurrenceFrequency:
          allOf:
            - $ref: "#/components/schemas/RecurrenceFrequency"
          description: The frequency of the services recurrence
        interval:
          type: integer
          description: The interval of how often it occurs i.e. RecurrencyFrequency =
            Monthly and interval = 3 this means quarterly
          format: int32
        assetIds:
          type: array
          items:
            type: string
          description: Assets that are associated with the service schedule
        includeAllCategoryAssets:
          type: boolean
          description: When true, the service schedule targets all assets within the
            selected category
        dayInWeek:
          type: array
          items:
            $ref: "#/components/schemas/DayInWeek"
          description: The day in the week i.e. monday = 1
          nullable: true
        dayInMonth:
          type: array
          items:
            $ref: "#/components/schemas/DayInMonth"
          description: The day in the month
          nullable: true
        monthInYear:
          type: array
          items:
            $ref: "#/components/schemas/MonthInYear"
          description: Month in the year
          nullable: true
        taskDefinitionIds:
          type: array
          items:
            type: string
          description: Task definition ids for this service schedule
          nullable: true
        defaultJobTypeId:
          type: integer
          description: Default job type id for this service schedule
          format: int64
          nullable: true
      additionalProperties: false
      description: Payload to create a service schedule
    DayInMonth:
      enum:
        - day1
        - day2
        - day3
        - day4
        - day5
        - day6
        - day7
        - day8
        - day9
        - day10
        - day11
        - day12
        - day13
        - day14
        - day15
        - day16
        - day17
        - day18
        - day19
        - day20
        - day21
        - day22
        - day23
        - day24
        - day25
        - day26
        - day27
        - day28
        - last
      type: string
      example: day1
    DayInWeek:
      enum:
        - sunday
        - monday
        - tuesday
        - wednesday
        - thursday
        - friday
        - saturday
      type: string
      example: sunday
    EndServiceAgreementModel:
      type: object
      properties:
        effectiveEndAt:
          type: string
          description: The effective end date of the service agreement
          format: date
          x-optional: Omit to retain current value
      additionalProperties: false
    FileEntityType:
      enum:
        - asset
      type: string
      example: asset
    GetAssetsQuery:
      type: object
      properties:
        id:
          type: array
          items:
            type: string
          description: Only return assets where `id` matches the value(s) provided
        pageNumber:
          maximum: 1073741
          minimum: 1
          type: integer
          description: The page number being requested
          format: int32
        pageSize:
          maximum: 2000
          minimum: 1
          type: integer
          description: The page size being requested
          format: int32
        siteId:
          type: array
          items:
            type: integer
            format: int64
          description: Only return assets where `siteId` matches the value(s) provided
        categoryId:
          type: array
          items:
            type: string
          description: Only return assets where `categoryId` matches the value(s) provided
        condition:
          type: array
          items:
            $ref: "#/components/schemas/AssetCondition"
          description: Only return assets where `condition` matches the value(s) provided
        status:
          type: array
          items:
            $ref: "#/components/schemas/AssetStatus"
          description: Only return assets where `status` matches the value(s) provided
        modifiedAtFrom:
          type: string
          description: The UTC timestamp for filtering assets by modification or creation
            date (whichever is newer)
          format: date-time
          nullable: true
        modifiedAtTo:
          type: string
          description: The UTC timestamp for filtering assets by modification or creation
            date (whichever is older)
          format: date-time
          nullable: true
        sortBy:
          allOf:
            - $ref: "#/components/schemas/AssetSortOptions"
          description: The means to sort the results
          nullable: true
        direction:
          allOf:
            - $ref: "#/components/schemas/SortDirection"
          description: The direction to apply the sort
          nullable: true
        searchText:
          type: string
          description: The text to search for in asset ID, reference, or barcode
      additionalProperties: false
    GetServiceAgreementPlannerQueryResponse:
      type: object
      properties:
        sites:
          type: array
          items:
            $ref: "#/components/schemas/SiteModel"
          description: The array of sites for the planner
      additionalProperties: false
    GetServiceAttemptsQuery:
      type: object
      properties:
        pageNumber:
          maximum: 21474836
          minimum: 1
          type: integer
          description: The page number being requested
          format: int32
        pageSize:
          maximum: 100
          minimum: 1
          type: integer
          description: The page size being requested
          format: int32
        serviceId:
          type: string
          description: The unique id of the service
          nullable: true
        jobIds:
          type: array
          items:
            type: integer
            format: int64
          description: The list of job IDs
        assetSiteIds:
          type: array
          items:
            type: integer
            format: int64
          description: The list of asset site ids
        modifiedAtFrom:
          type: string
          description: The UTC timestamp for filtering services attempts by modification
            or creation date (whichever is newer)
          format: date-time
          nullable: true
        modifiedAtTo:
          type: string
          description: The UTC timestamp for filtering service attempts by modification or
            creation date (whichever is older)
          format: date-time
          nullable: true
        sortBy:
          allOf:
            - $ref: "#/components/schemas/ServiceAttemptsSortOptions"
          description: List of sorting options
          nullable: true
        direction:
          allOf:
            - $ref: "#/components/schemas/SortDirection"
          description: The direction to apply the sort
          nullable: true
        includeAssetImage:
          type: boolean
          description: Include the latest asset image url
      additionalProperties: false
    GetServiceJobResponse:
      required:
        - items
      type: object
      properties:
        dates:
          type: array
          items:
            $ref: "#/components/schemas/JobsByDueAtModel"
          description: The array of dates containing jobs
        items:
          type: array
          items:
            $ref: "#/components/schemas/ServiceJobModel"
          description: A list of individual jobs that need to be created based on the
            services that are due
        status:
          allOf:
            - $ref: "#/components/schemas/GetServiceJobResponseStatus"
          description: "Indicate whether the creation process is still ongoing. Possible
            values: Inprogress, Success, PartialSuccess and Fail"
          readOnly: true
      additionalProperties: false
    GetServiceJobResponseStatus:
      enum:
        - inprogress
        - success
        - partialSuccess
        - fail
      type: string
      description: Represents the possible status values for the creation process
      example: inprogress
    GetServicesQuery:
      type: object
      properties:
        pageNumber:
          maximum: 21474836
          minimum: 1
          type: integer
          description: The page number being requested
          format: int32
        pageSize:
          maximum: 100
          minimum: 1
          type: integer
          description: The page size being requested
          format: int32
        serviceAgreementId:
          type: string
          description: The service agreement ID
          nullable: true
        assetSiteIds:
          type: array
          items:
            type: integer
            format: int64
          description: The list of asset site IDs
          nullable: true
        scheduleIds:
          type: array
          items:
            type: string
          description: The list of schedule IDs
          nullable: true
        categoryIds:
          type: array
          items:
            type: string
          description: The list of category IDs
          nullable: true
        jobIds:
          type: array
          items:
            type: integer
            format: int64
          description: The list of job IDs
          nullable: true
        dueAtFrom:
          type: string
          description: The start date for filtering services due
          format: date
          nullable: true
        dueAtTo:
          type: string
          description: The end date for filtering services due
          format: date
          nullable: true
        modifiedAtFrom:
          type: string
          description: The UTC timestamp for filtering services by modification or
            creation date (whichever is newer)
          format: date-time
          nullable: true
        modifiedAtTo:
          type: string
          description: The UTC timestamp for filtering services by modification or
            creation date (whichever is older)
          format: date-time
          nullable: true
        completedAtFrom:
          type: string
          description: The start date for filtering services completed
          format: date-time
          nullable: true
        completedAtTo:
          type: string
          description: The end date for filtering services completed
          format: date-time
          nullable: true
        scheduledAtFrom:
          type: string
          description: The start date for filtering services scheduled
          format: date-time
          nullable: true
        scheduledAtTo:
          type: string
          description: The end date for filtering services scxheduled
          format: date-time
          nullable: true
        searchText:
          type: string
          description: The text to search for in asset ID, reference, or barcode
          nullable: true
        status:
          type: array
          items:
            $ref: "#/components/schemas/ServiceStatus"
          description: List of statuses to filter by
          nullable: true
        sortBy:
          allOf:
            - $ref: "#/components/schemas/ServicesSortOptions"
          description: The field to sort by
          nullable: true
        direction:
          allOf:
            - $ref: "#/components/schemas/SortDirection"
          description: The direction to apply the sort
          nullable: true
        isInProgress:
          type: boolean
          description: The flag to indicate if the service has attempts in progress
          nullable: true
      additionalProperties: false
    JobModel:
      required:
        - dueAt
        - duration
        - jobTypeId
        - num
        - schedules
        - siteId
        - title
      type: object
      properties:
        num:
          type: integer
          description: The job number
          format: int32
        title:
          minLength: 1
          type: string
          description: The title of the job
        jobTypeId:
          type: integer
          description: The job type ID
          format: int64
        siteId:
          type: integer
          description: The ID of the site associated with the job
          format: int64
        duration:
          type: integer
          description: The duration of the job in minutes
          format: int32
        dueAt:
          type: string
          description: When this Job should be due
          format: date
        jobId:
          type: integer
          description: The service job ID
          format: int64
          nullable: true
        status:
          allOf:
            - $ref: "#/components/schemas/ServiceJobStatus"
          description: The service job status
        schedules:
          type: array
          items:
            $ref: "#/components/schemas/JobScheduleModel"
          description: The array of schedules associated with the job
      additionalProperties: false
      description: Represents a job with its details
    JobScheduleModel:
      required:
        - categoryId
        - categoryName
        - id
        - name
        - services
      type: object
      properties:
        id:
          minLength: 1
          type: string
          description: The ID of the schedule
        name:
          minLength: 1
          type: string
          description: The name of the schedule
        categoryId:
          minLength: 1
          type: string
          description: The ID of the category associated with the schedule
        categoryName:
          minLength: 1
          type: string
          description: The name of the category associated with the schedule
        services:
          type: array
          items:
            $ref: "#/components/schemas/JobServiceModel"
          description: The array of services associated with the schedule
      additionalProperties: false
      description: Represents a schedule associated with a job
    JobServiceModel:
      required:
        - assetDisplayId
        - assetId
        - assetReference
        - dueAt
        - duration
        - id
        - taskDefinitionIds
      type: object
      properties:
        id:
          minLength: 1
          type: string
          description: The ID of the service
        assetId:
          minLength: 1
          type: string
          description: The ID of the asset in the service
        assetDisplayId:
          minLength: 1
          type: string
          description: The display ID of the asset
        assetReference:
          minLength: 1
          type: string
          description: The reference of the asset in the service
        duration:
          type: integer
          description: The duration of the service in minutes
          format: int32
        dueAt:
          type: string
          description: Service Due At
          format: date
        taskDefinitionIds:
          type: array
          items:
            type: string
          description: Task Definition Ids
      additionalProperties: false
      description: Represents a service associated with a schedule
    JobsByDueAtModel:
      required:
        - dueAt
        - jobs
      type: object
      properties:
        dueAt:
          type: string
          description: The date for the jobs
          format: date
        jobs:
          type: array
          items:
            $ref: "#/components/schemas/JobModel"
          description: The array of jobs on this date
      additionalProperties: false
      description: Represents a date and its associated jobs
    MonthInYear:
      enum:
        - january
        - february
        - march
        - april
        - may
        - june
        - july
        - august
        - september
        - october
        - november
        - december
      type: string
      example: january
    PreviewJobsQuery:
      required:
        - serviceIds
      type: object
      properties:
        serviceIds:
          type: array
          items:
            type: string
          description: The due service IDs for which jobs should be created
      additionalProperties: false
    PreviewJobsQueryResponse:
      type: object
      properties:
        dueAtFrom:
          type: string
          description: The start date for filtering jobs
          format: date
          nullable: true
        dueAtTo:
          type: string
          description: The end date for filtering jobs
          format: date
          nullable: true
        siteIds:
          type: array
          items:
            type: integer
            format: int64
          description: The array of site IDs associated with the jobs
        dates:
          type: array
          items:
            $ref: "#/components/schemas/JobsByDueAtModel"
          description: The array of dates containing jobs
        unprocessableServices:
          type: array
          items:
            $ref: "#/components/schemas/ServiceModel"
          description: The array of list of services that can't be processed
        invalidStatuses:
          type: array
          items:
            type: string
          description: Represent list of error messages for all services with status that
            is not unscheduled or attempted
          readOnly: true
        invalidDefaultJobType:
          type: array
          items:
            type: string
          description: Represent list of error messages for all services with service
            schedule that does not have default job type
          readOnly: true
      additionalProperties: false
      description: Represents the root model for reading jobs from services
    ProblemDetails:
      type: object
      properties:
        type:
          type: string
          description: A URI reference [RFC3986] that identifies the problem type
          nullable: true
          example: https://example.com/probs/out-of-credit
        title:
          type: string
          description: A short, human-readable summary of the problem type
          nullable: true
          example: You do not have enough credit
        status:
          type: integer
          description: The HTTP status code([RFC7231], Section 6) generated by the origin
            server for this occurrence of the problem
          format: int32
          nullable: true
          example: 403
        detail:
          type: string
          description: A human-readable explanation specific to this occurrence of the
            problem
          nullable: true
          example: Your current balance is 30, but that costs 50
        instance:
          type: string
          description: A URI reference that identifies the specific occurrence of the
            problem
          nullable: true
          example: /account/12345/msgs/abc
      additionalProperties: {}
    ReadAssetByIdModel:
      required:
        - condition
        - id
        - siteId
        - status
      type: object
      properties:
        id:
          minLength: 1
          type: string
          description: The unique identifier of the asset
        displayId:
          type: string
          description: The friendly identifier of the asset
        createdAt:
          type: string
          description: The UTC timestamp of when this asset was created
          format: date-time
        modifiedAt:
          type: string
          description: The UTC timestamp of when this asset was last modified
          format: date-time
          nullable: true
        categoryId:
          type: string
          description: The unique id of the category that this asset is assigned to
        categoryName:
          type: string
          description: The name of the category associated to the asset
        manufacturerSerialNumber:
          type: string
          description: The manufacturerSerialNumber of the asset
          nullable: true
        condition:
          allOf:
            - $ref: "#/components/schemas/AssetCondition"
          description: The condition of the asset
        reference:
          type: string
          description: The reference of the asset
          nullable: true
        status:
          allOf:
            - $ref: "#/components/schemas/AssetStatus"
          description: The status of the asset
        location:
          type: string
          description: The location of the asset
          nullable: true
        barcode:
          type: string
          description: The barcode of the asset
          nullable: true
        manufacturer:
          type: string
          description: The manufacturer of the asset
        model:
          type: string
          description: The model of the asset
        siteId:
          type: integer
          description: The unique identifier of the site where the asset is located
          format: int64
        manufacturedAt:
          type: string
          description: The date that the asset was originally manufactured
          format: date
          nullable: true
        installedAt:
          type: string
          description: The date that the asset was installed at the site
          format: date
          nullable: true
        lastServiceAt:
          type: string
          description: The date that the asset was last serviced
          format: date
          nullable: true
        warrantyExpiresAt:
          type: string
          description: The date that the asset warranty expires
          format: date
          nullable: true
        endOfLifeAt:
          type: string
          description: The date that the asset is considered end of life
          format: date
          nullable: true
        hasImages:
          type: boolean
          description: A flag indicating the asset has images attached
        hasServices:
          type: boolean
          description: A flag indicating the asset has associated services
      additionalProperties: false
    ReadAssetImageModel:
      type: object
      properties:
        id:
          type: string
          description: The unique identifier of the asset image
        fileName:
          type: string
          description: The filename of the uploaded asset image, hosted in s3
        uploadedByUserId:
          type: integer
          description: The id of the user that uploaded the image
          format: int64
        createdAt:
          type: string
          description: The UTC timestamp of when this asset image was created
          format: date-time
        modifiedAt:
          type: string
          description: The UTC timestamp of when this asset image was modified
          format: date-time
          nullable: true
      additionalProperties: false
    ReadAssetImageModelPagedResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/ReadAssetImageModel"
          description: The items returned for the requested page
        pageNumber:
          type: integer
          description: The page number of the response where 1 is the first page
          format: int32
          example: 2
        pageSize:
          type: integer
          description: The number of items requested for the current page
          format: int32
          example: 100
        pageItemCount:
          type: integer
          description: The number of items returned in the current page
          format: int32
          readOnly: true
          example: 55
        totalItemCount:
          type: integer
          description: The total number of items across all pages
          format: int32
          example: 155
        fetchedAt:
          type: string
          description: The server UTC timestamp that represents when this data was fetched
          format: date-time
          readOnly: true
      additionalProperties: false
      description: A paged collection of items
    ReadAssetImagePathModel:
      type: object
      properties:
        path:
          type: string
          description: The URL of where the image can be obtained
        expirationAt:
          type: string
          description: The UTC timestamp of when the Url will expire
          format: date-time
      additionalProperties: false
    ReadAssetModel:
      required:
        - condition
        - id
        - siteId
        - status
      type: object
      properties:
        id:
          minLength: 1
          type: string
          description: The unique identifier of the asset
        displayId:
          type: string
          description: The friendly identifier of the asset
        createdAt:
          type: string
          description: The UTC timestamp of when this asset was created
          format: date-time
        modifiedAt:
          type: string
          description: The UTC timestamp of when this asset was last modified
          format: date-time
          nullable: true
        categoryId:
          type: string
          description: The unique id of the category that this asset is assigned to
        categoryName:
          type: string
          description: The name of the category associated to the asset
        manufacturerSerialNumber:
          type: string
          description: The manufacturerSerialNumber of the asset
          nullable: true
        condition:
          allOf:
            - $ref: "#/components/schemas/AssetCondition"
          description: The condition of the asset
        reference:
          type: string
          description: The reference of the asset
          nullable: true
        status:
          allOf:
            - $ref: "#/components/schemas/AssetStatus"
          description: The status of the asset
        location:
          type: string
          description: The location of the asset
          nullable: true
        barcode:
          type: string
          description: The barcode of the asset
          nullable: true
        manufacturer:
          type: string
          description: The manufacturer of the asset
        model:
          type: string
          description: The model of the asset
        siteId:
          type: integer
          description: The unique identifier of the site where the asset is located
          format: int64
        manufacturedAt:
          type: string
          description: The date that the asset was originally manufactured
          format: date
          nullable: true
        installedAt:
          type: string
          description: The date that the asset was installed at the site
          format: date
          nullable: true
        lastServiceAt:
          type: string
          description: The date that the asset was last serviced
          format: date
          nullable: true
        warrantyExpiresAt:
          type: string
          description: The date that the asset warranty expires
          format: date
          nullable: true
        endOfLifeAt:
          type: string
          description: The date that the asset is considered end of life
          format: date
          nullable: true
        hasImages:
          type: boolean
          description: A flag indicating the asset has images attached
      additionalProperties: false
    ReadAssetModelPagedResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/ReadAssetModel"
          description: The items returned for the requested page
        pageNumber:
          type: integer
          description: The page number of the response where 1 is the first page
          format: int32
          example: 2
        pageSize:
          type: integer
          description: The number of items requested for the current page
          format: int32
          example: 100
        pageItemCount:
          type: integer
          description: The number of items returned in the current page
          format: int32
          readOnly: true
          example: 55
        totalItemCount:
          type: integer
          description: The total number of items across all pages
          format: int32
          example: 155
        fetchedAt:
          type: string
          description: The server UTC timestamp that represents when this data was fetched
          format: date-time
          readOnly: true
      additionalProperties: false
      description: A paged collection of items
    ReadAssetsCountBySiteModel:
      required:
        - assetCount
        - siteId
      type: object
      properties:
        siteId:
          type: integer
          description: The unique identifier of the site
          format: int64
        assetCount:
          type: integer
          description: The count of assets at the site
          format: int32
      additionalProperties: false
    ReadAssetsCountBySiteModelPagedResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/ReadAssetsCountBySiteModel"
          description: The items returned for the requested page
        pageNumber:
          type: integer
          description: The page number of the response where 1 is the first page
          format: int32
          example: 2
        pageSize:
          type: integer
          description: The number of items requested for the current page
          format: int32
          example: 100
        pageItemCount:
          type: integer
          description: The number of items returned in the current page
          format: int32
          readOnly: true
          example: 55
        totalItemCount:
          type: integer
          description: The total number of items across all pages
          format: int32
          example: 155
        fetchedAt:
          type: string
          description: The server UTC timestamp that represents when this data was fetched
          format: date-time
          readOnly: true
      additionalProperties: false
      description: A paged collection of items
    ReadAuditTrailModel:
      type: object
      properties:
        id:
          type: string
          description: The unique identifier of the audit trail entry
        entityName:
          type: string
          description: The name of the entity affected by the action
        entityId:
          type: string
          description: The identifier of the entity affected by the action
        action:
          type: string
          description: The action performed on the entity
        createdAt:
          type: string
          description: The UTC timestamp of when this action was performed
          format: date-time
        createdByUserId:
          type: integer
          description: The unique identifier of the user who performed the action
          format: int64
        oldValues:
          type: string
          description: The old values of the entity before the action
        newValues:
          type: string
          description: The new values of the entity after the action
      additionalProperties: false
    ReadAuditTrailModelPagedResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/ReadAuditTrailModel"
          description: The items returned for the requested page
        pageNumber:
          type: integer
          description: The page number of the response where 1 is the first page
          format: int32
          example: 2
        pageSize:
          type: integer
          description: The number of items requested for the current page
          format: int32
          example: 100
        pageItemCount:
          type: integer
          description: The number of items returned in the current page
          format: int32
          readOnly: true
          example: 55
        totalItemCount:
          type: integer
          description: The total number of items across all pages
          format: int32
          example: 155
        fetchedAt:
          type: string
          description: The server UTC timestamp that represents when this data was fetched
          format: date-time
          readOnly: true
      additionalProperties: false
      description: A paged collection of items
    ReadCategoryModel:
      required:
        - id
        - name
      type: object
      properties:
        id:
          minLength: 1
          type: string
          description: The unique identifier of the category
        createdAt:
          type: string
          description: The UTC timestamp of when this category was created
          format: date-time
        modifiedAt:
          type: string
          description: The UTC timestamp of when this category was last modified
          format: date-time
          nullable: true
        name:
          minLength: 1
          type: string
          description: The name of the category
      additionalProperties: false
    ReadCategoryModelPagedResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/ReadCategoryModel"
          description: The items returned for the requested page
        pageNumber:
          type: integer
          description: The page number of the response where 1 is the first page
          format: int32
          example: 2
        pageSize:
          type: integer
          description: The number of items requested for the current page
          format: int32
          example: 100
        pageItemCount:
          type: integer
          description: The number of items returned in the current page
          format: int32
          readOnly: true
          example: 55
        totalItemCount:
          type: integer
          description: The total number of items across all pages
          format: int32
          example: 155
        fetchedAt:
          type: string
          description: The server UTC timestamp that represents when this data was fetched
          format: date-time
          readOnly: true
      additionalProperties: false
      description: A paged collection of items
    ReadServiceAgreementModel:
      required:
        - displayId
        - id
        - ownerId
        - status
      type: object
      properties:
        id:
          minLength: 1
          type: string
          description: The unique identifier of the service agreement
        displayId:
          minLength: 1
          type: string
          description: The friendly identifier of the agreement
        siteIds:
          type: array
          items:
            type: integer
            format: int64
          description: The list of site IDs associated with the service agreement
          nullable: true
        ownerId:
          type: integer
          description: Id of the contact that is financially responsible for the agreement
          format: int64
        createdAt:
          type: string
          description: The UTC timestamp of when this service agreement was created
          format: date-time
        modifiedAt:
          type: string
          description: The UTC timestamp of when this service agreement was last modified
          format: date-time
          nullable: true
        reference:
          type: string
          description: The reference of the service agreement
          nullable: true
        startAt:
          type: string
          description: The start date of the service agreement
          format: date
        endAt:
          type: string
          description: The end date of the service agreement
          format: date
        effectiveEndAt:
          type: string
          description: The effective end date of the service agreement
          format: date
          nullable: true
        effectiveEndByUserId:
          type: integer
          description: The user who ended the service agreement
          format: int64
          nullable: true
        status:
          allOf:
            - $ref: "#/components/schemas/ServiceAgreementReadStatus"
          description: The status of the service agreement
      additionalProperties: false
    ReadServiceAttemptModel:
      required:
        - attemptAtDate
        - id
        - serviceId
        - status
      type: object
      properties:
        id:
          minLength: 1
          type: string
          description: The unique identifier of the service attempt
        serviceId:
          minLength: 1
          type: string
          description: The unique identifier of the service
        createdAt:
          type: string
          description: The UTC timestamp of when this service attempt was created
          format: date-time
        modifiedAt:
          type: string
          description: The UTC timestamp of when this service attempt was last modified
          format: date-time
          nullable: true
        status:
          allOf:
            - $ref: "#/components/schemas/ServiceAttemptStatus"
          description: The status of the service attempt
        reason:
          allOf:
            - $ref: "#/components/schemas/ServiceAttemptReason"
          description: The reason of the service attempt (optional)
          nullable: true
        notes:
          type: string
          description: The notes associated with the service attempt
        attemptAtDate:
          type: string
          description: The date of the attempt
          format: date
        attemptAtTime:
          type: string
          description: "The time of the attempt  (format: 15:30:00)"
          format: time
          nullable: true
        assetId:
          type: string
          description: The id of the asset
        assetBarcode:
          type: string
          description: The barcode of the asset
          nullable: true
        assetManufacturer:
          type: string
          description: The manufacturer of the asset
          nullable: true
        assetModel:
          type: string
          description: The model of the asset
          nullable: true
        assetCondition:
          allOf:
            - $ref: "#/components/schemas/AssetCondition"
          description: The condition of the asset
        assetDisplayId:
          type: string
          description: The friendly id of the asset
        assetSiteId:
          type: integer
          description: The unique identifier of the site that the asset belongs to
          format: int64
        assetReference:
          type: string
          description: The reference of the asset
          nullable: true
        assetCategoryId:
          type: string
          description: The category id of the asset
          nullable: true
        assetCategoryName:
          type: string
          description: The category of the asset
          nullable: true
        assetLocation:
          type: string
          description: The location of the asset
          nullable: true
        serviceName:
          type: string
          description: The name of the service
        serviceDueAt:
          type: string
          description: The due at date of the service
          format: date
        jobId:
          type: integer
          description: The unique identifier of the job
          format: int64
          nullable: true
        resourceId:
          type: integer
          description: The unique identifier of the resource
          format: int64
          nullable: true
        taskIds:
          type: array
          items:
            type: string
          description: Task IDs for the service attempt (optional)
        assetImageUrl:
          type: string
          description: The path of asset image
          nullable: true
      additionalProperties: false
      description: Model to read service attempt details
    ReadServiceAttemptModelPagedResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/ReadServiceAttemptModel"
          description: The items returned for the requested page
        pageNumber:
          type: integer
          description: The page number of the response where 1 is the first page
          format: int32
          example: 2
        pageSize:
          type: integer
          description: The number of items requested for the current page
          format: int32
          example: 100
        pageItemCount:
          type: integer
          description: The number of items returned in the current page
          format: int32
          readOnly: true
          example: 55
        totalItemCount:
          type: integer
          description: The total number of items across all pages
          format: int32
          example: 155
        fetchedAt:
          type: string
          description: The server UTC timestamp that represents when this data was fetched
          format: date-time
          readOnly: true
      additionalProperties: false
      description: A paged collection of items
    ReadServiceModel:
      type: object
      properties:
        id:
          type: string
          description: The unique identifier of the service
        assetId:
          type: string
          description: The unique identifier of the asset
        assetDisplayId:
          type: string
          description: The friendly unique identifier of the asset
        scheduleId:
          type: string
          description: The unique identifier of the schedule
        name:
          type: string
          description: The name of the service
        status:
          allOf:
            - $ref: "#/components/schemas/ServiceStatus"
          description: The status of the service
        overdueDays:
          type: integer
          description: The number of overdue days if any
          format: int32
          nullable: true
        dueAt:
          type: string
          description: The due date of the service
          format: date
        createdAt:
          type: string
          description: The UTC timestamp of when this service was created
          format: date-time
        completedAt:
          type: string
          description: The UTC timestamp of when this service was completed
          format: date-time
          nullable: true
        modifiedAt:
          type: string
          description: The UTC timestamp of when this service was last modified
          format: date-time
          nullable: true
        assetReference:
          type: string
          description: The reference of the asset
          nullable: true
        assetLocation:
          type: string
          description: The location of the asset
          nullable: true
        assetSiteId:
          type: integer
          description: The site identifier of the asset
          format: int64
        serviceScheduleCategoryName:
          type: string
          description: The name of the service schedule category
        serviceScheduleAgreementId:
          type: string
          description: The agreement identifier of the service schedule
        serviceScheduleAgreementDisplayId:
          type: string
          description: The agreement friendly identifier of the service schedule
        scheduledAt:
          type: string
          description: The timestamp of when this service has latest scheduled attempt
          format: date-time
          nullable: true
        taskDefinitionIds:
          type: array
          items:
            type: string
          description: The task definition IDs associated with the service
        cancelledAt:
          type: string
          description: The cancelled date of the service
          format: date-time
          nullable: true
        cancelledByUserId:
          type: integer
          description: The user who cancelled the service
          format: int64
          nullable: true
        serviceAttemptedReason:
          allOf:
            - $ref: "#/components/schemas/ServiceAttemptReason"
          description: The reason for the service attempt if status is `Attempted`
          nullable: true
        isInProgress:
          type: boolean
          description: The flag to indicate if the service has attempts in progress
      additionalProperties: false
    ReadServiceModelPagedResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/ReadServiceModel"
          description: The items returned for the requested page
        pageNumber:
          type: integer
          description: The page number of the response where 1 is the first page
          format: int32
          example: 2
        pageSize:
          type: integer
          description: The number of items requested for the current page
          format: int32
          example: 100
        pageItemCount:
          type: integer
          description: The number of items returned in the current page
          format: int32
          readOnly: true
          example: 55
        totalItemCount:
          type: integer
          description: The total number of items across all pages
          format: int32
          example: 155
        fetchedAt:
          type: string
          description: The server UTC timestamp that represents when this data was fetched
          format: date-time
          readOnly: true
      additionalProperties: false
      description: A paged collection of items
    ReadServiceScheduleModel:
      type: object
      properties:
        id:
          type: string
          description: The unique identifier of the service schedule
        name:
          type: string
          description: The name of the service schedule
        defaultDuration:
          type: integer
          description: The duration in minutes that services from this schedule are
            expected to take
          format: int32
        categoryId:
          type: string
          description: The id of the asset category that this service schedule operates on
        categoryName:
          type: string
          description: The name of the asset category that this service schedule operates on
        assetIds:
          type: array
          items:
            type: string
          description: Assets that are associated with the service schedule
        includeAllCategoryAssets:
          type: boolean
          description: When true, the service schedule targets all assets within the
            selected category
        recurrenceFrequency:
          allOf:
            - $ref: "#/components/schemas/RecurrenceFrequency"
          description: The type of recurrence that this service schedule should use
        interval:
          type: integer
          description: Defines the time period between each required service, relative to
            it's recurrence frequency
          format: int32
        dayInWeek:
          type: array
          items:
            $ref: "#/components/schemas/DayInWeek"
          description: For weekly recurrence frequencies, specifies the weekdays that a
            schedule should be created on
          nullable: true
        dayInMonth:
          type: array
          items:
            $ref: "#/components/schemas/DayInMonth"
          description: For monthly and yearly recurrence frequencies, specifies the days
            that a schedule should be created on in a given month
          nullable: true
        monthInYear:
          type: array
          items:
            $ref: "#/components/schemas/MonthInYear"
          description: For yearly recurrence frequencies, specifics the months that a
            schedule should be created in for a given year
          nullable: true
        taskDefinitionIds:
          type: array
          items:
            type: string
          description: Task definition ids for this service schedule
          nullable: true
        createdAt:
          type: string
          description: The UTC timestamp of when this service schedule was created
          format: date-time
        modifiedAt:
          type: string
          description: The UTC timestamp of when this service schedule was last modified
          format: date-time
          nullable: true
        defaultJobTypeId:
          type: integer
          description: Default job type id for this service schedule
          format: int64
          nullable: true
      additionalProperties: false
    ReadServiceScheduleModelPagedResponse:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/ReadServiceScheduleModel"
          description: The items returned for the requested page
        pageNumber:
          type: integer
          description: The page number of the response where 1 is the first page
          format: int32
          example: 2
        pageSize:
          type: integer
          description: The number of items requested for the current page
          format: int32
          example: 100
        pageItemCount:
          type: integer
          description: The number of items returned in the current page
          format: int32
          readOnly: true
          example: 55
        totalItemCount:
          type: integer
          description: The total number of items across all pages
          format: int32
          example: 155
        fetchedAt:
          type: string
          description: The server UTC timestamp that represents when this data was fetched
          format: date-time
          readOnly: true
      additionalProperties: false
      description: A paged collection of items
    RecurrenceFrequency:
      enum:
        - daily
        - weekly
        - monthly
        - yearly
      type: string
      example: daily
    ServiceAgreementReadStatus:
      enum:
        - draft
        - active
        - ended
      type: string
      example: draft
    ServiceAgreementStatus:
      enum:
        - draft
        - active
      type: string
      example: draft
    ServiceAttemptReason:
      enum:
        - noAccess
        - unableToLocate
        - failedRiskAssessment
        - partsRequired
        - condemned
      type: string
      example: noAccess
    ServiceAttemptStatus:
      enum:
        - scheduled
        - success
        - fail
        - inProgress
      type: string
      example: scheduled
    ServiceAttemptsSortOptions:
      enum:
        - serviceAttemptAtDateTime
        - serviceAttemptModifiedAtDateTime
      type: string
      description: Shows the possible values for sorting service attempts
      example: serviceAttemptAtDateTime
    ServiceJobModel:
      required:
        - serviceId
      type: object
      properties:
        serviceId:
          minLength: 1
          type: string
          description: Represent the due service id
        serviceAttemptId:
          type: string
          description: Represent service attempt id that is created and linked to the job
          nullable: true
        status:
          allOf:
            - $ref: "#/components/schemas/ServiceJobStatus"
          description: "The service job status can be one of the following values:
            Unprocessed, Success, or Fail"
        jobId:
          type: integer
          description: Represent job id that is created and linked to the service attempt
          format: int64
          nullable: true
      additionalProperties: false
    ServiceJobStatus:
      enum:
        - unprocessed
        - success
        - fail
      type: string
      example: unprocessed
    ServiceModel:
      required:
        - assetDisplayId
        - assetId
        - assetReference
        - assetSiteId
        - dueAt
        - hasDefaultJobTypeId
        - id
        - isCreateJobPossible
        - isSchedulePossible
        - scheduleCategoryId
        - scheduleCategoryName
        - scheduleDefaultDuration
        - scheduleDefaultJobTypeId
        - scheduleId
        - scheduleName
        - serviceName
        - status
        - taskDefinitionIds
      type: object
      properties:
        id:
          minLength: 1
          type: string
        scheduleDefaultJobTypeId:
          type: integer
          format: int64
        status:
          allOf:
            - $ref: "#/components/schemas/ServiceStatus"
        dueAt:
          type: string
          format: date
        assetId:
          minLength: 1
          type: string
        assetDisplayId:
          minLength: 1
          type: string
        assetReference:
          minLength: 1
          type: string
        assetSiteId:
          type: integer
          format: int64
        scheduleId:
          minLength: 1
          type: string
        scheduleName:
          minLength: 1
          type: string
        scheduleCategoryId:
          minLength: 1
          type: string
        scheduleCategoryName:
          minLength: 1
          type: string
        scheduleDefaultDuration:
          type: integer
          format: int32
        hasDefaultJobTypeId:
          type: boolean
        isSchedulePossible:
          type: boolean
        isCreateJobPossible:
          type: boolean
        serviceName:
          minLength: 1
          type: string
        taskDefinitionIds:
          type: array
          items:
            type: string
        name:
          type: string
          readOnly: true
      additionalProperties: false
    ServiceStatus:
      enum:
        - unscheduled
        - assigned
        - complete
        - cancelled
        - attempted
      type: string
      example: unscheduled
    ServicesSortOptions:
      enum:
        - serviceCreationDate
        - serviceDueDate
        - serviceScheduleName
        - assetReference
        - assetId
        - assetLocation
        - serviceModifiedDate
        - serviceScheduledDate
        - assetDisplayId
      type: string
      description: Shows the possible values for sorting services
      example: serviceCreationDate
    SiteModel:
      type: object
      properties:
        id:
          type: integer
          description: The unique identifier of the site
          format: int64
        weeks:
          type: array
          items:
            $ref: "#/components/schemas/WeekModel"
          description: The array of weeks containing service counts for the site
        categories:
          type: array
          items:
            $ref: "#/components/schemas/CategoryModel"
          description: The array of category containing service counts for each category
      additionalProperties: false
    SortDirection:
      enum:
        - ascending
        - descending
      type: string
      description: Represents the direction in which sorting should be applied
      example: ascending
    StringPostResponse:
      type: object
      properties:
        id:
          type: string
          description: Identifier of the newly created record
      additionalProperties: false
      description: Represents a response for a POST request, containing the ID of the
        newly created record
    UpdateAssetModel:
      type: object
      properties:
        siteId:
          type: integer
          description: The unique identifier of the site where the asset is located
          format: int64
          x-optional: Omit to retain current value
        manufacturerSerialNumber:
          type: string
          description: The manufacturerSerialNumber of the asset
          x-optional: Omit to retain current value
        condition:
          allOf:
            - $ref: "#/components/schemas/AssetCondition"
          description: The condition of the asset
          x-optional: Omit to retain current value
        reference:
          type: string
          description: The reference of the asset
          x-optional: Omit to retain current value
        status:
          allOf:
            - $ref: "#/components/schemas/AssetStatus"
          description: The Status of the asset
          x-optional: Omit to retain current value
        location:
          type: string
          description: The location of the asset
          x-optional: Omit to retain current value
        barcode:
          type: string
          description: The barcode of the asset
          x-optional: Omit to retain current value
        manufacturer:
          type: string
          description: The manufacturer of the asset
          x-optional: Omit to retain current value
        model:
          type: string
          description: The model of the asset
          x-optional: Omit to retain current value
        manufacturedAt:
          type: string
          description: The date that the asset was originally manufactured
          format: date
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        installedAt:
          type: string
          description: The date that the asset was installed at the site
          format: date
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        lastServiceAt:
          type: string
          description: The date that the asset was last serviced
          format: date
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        warrantyExpiresAt:
          type: string
          description: The date that the asset warranty expires
          format: date
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        endOfLifeAt:
          type: string
          description: The date that the asset is considered end of life
          format: date
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        categoryId:
          type: string
          description: The category of the asset
          x-optional: Omit to retain current value
      additionalProperties: false
      description: Payload to update an asset
    UpdateCategoryModel:
      type: object
      properties:
        name:
          type: string
          description: The name of the category
          x-optional: Omit to retain current value
      additionalProperties: false
      description: Payload to update a category
    UpdateServiceAgreementModel:
      type: object
      properties:
        ownerId:
          type: integer
          description: Id of the contact that is financially responsible for the agreement
          format: int64
          x-optional: Omit to retain current value
        siteIds:
          type: array
          items:
            type: integer
            format: int64
          description: The list of site IDs associated with the service agreement
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        reference:
          type: string
          description: The reference of the service agreement
          x-optional: Omit to retain current value
        startAt:
          type: string
          description: The start date of the service agreement
          format: date
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        endAt:
          type: string
          description: The end date of the service agreement
          format: date
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
      additionalProperties: false
    UpdateServiceAttemptModel:
      required:
        - attemptAtDate
      type: object
      properties:
        attemptAtDate:
          type: string
          description: The date of the attempt
          format: date
          x-optional: Omit to retain current value
        attemptAtTime:
          type: string
          description: "The time of the attempt  (format: 15:30:00)"
          format: time
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        reason:
          allOf:
            - $ref: "#/components/schemas/ServiceAttemptReason"
          description: The reason of the service attempt (optional)
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        notes:
          type: string
          description: The notes associated with the service attempt (optional)
          x-optional: Omit to retain current value
        status:
          allOf:
            - $ref: "#/components/schemas/ServiceAttemptStatus"
          description: The status of the service attempt (optional)
          x-optional: Omit to retain current value
        jobId:
          type: integer
          description: The job ID associated to the service attempt (optional)
          format: int64
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        resourceId:
          type: integer
          description: The resource ID associated to the service attempt (optional)
          format: int64
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
      additionalProperties: false
      description: Payload to update a service attempt
    UpdateServiceScheduleModel:
      type: object
      properties:
        name:
          type: string
          description: The name of the schedule
          x-optional: Omit to retain current value
        defaultDuration:
          type: integer
          description: The duration in minutes that a service of this type is estimated to
            take
          format: int32
          x-optional: Omit to retain current value
        categoryId:
          type: string
          description: The unique id of the category of assets that this service schedule
            operates upon
          x-optional: Omit to retain current value
        recurrenceFrequency:
          allOf:
            - $ref: "#/components/schemas/RecurrenceFrequency"
          description: The frequency of the services recurrence
          x-optional: Omit to retain current value
        interval:
          type: integer
          description: The interval of how often it occurs i.e. RecurrencyFrequency =
            Monthly and interval = 3 this means quarterly
          format: int32
          x-optional: Omit to retain current value
        dayInWeek:
          type: array
          items:
            $ref: "#/components/schemas/DayInWeek"
          description: The day in the week i.e. monday = 1
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        dayInMonth:
          type: array
          items:
            $ref: "#/components/schemas/DayInMonth"
          description: The day in the month
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        monthInYear:
          type: array
          items:
            $ref: "#/components/schemas/MonthInYear"
          description: Month in the year
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        assetIds:
          type: array
          items:
            type: string
          description: Assets that are associated with the service schedule
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        includeAllCategoryAssets:
          type: boolean
          description: When true, the service schedule targets all assets within the
            selected category
          x-optional: Omit to retain current value
        taskDefinitionIds:
          type: array
          items:
            type: string
          description: Task definition ids for this service schedule
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
        defaultJobTypeId:
          type: integer
          description: Default job type id for this service schedule
          format: int64
          nullable: true
          x-optional: Omit to retain current value or provide null to unset
      additionalProperties: false
      description: Payload to update a service schedule
    ValidateAssetResult:
      type: object
      properties:
        isValid:
          type: boolean
          description: Indicates whether the validation passed
        message:
          type: string
          description: Validation result message
      additionalProperties: false
      description: Result of asset validation
    ValidationProblemDetails:
      type: object
      properties:
        errors:
          type: object
          additionalProperties:
            type: array
            items:
              type: string
        type:
          type: string
          nullable: true
        title:
          type: string
          nullable: true
        status:
          type: integer
          format: int32
          nullable: true
        detail:
          type: string
          nullable: true
        instance:
          type: string
          nullable: true
      additionalProperties: {}
    WeekModel:
      type: object
      properties:
        servicesTotal:
          type: integer
          description: The total number of services for the week
          format: int32
        servicesCompleted:
          type: integer
          description: The number of services completed for the week
          format: int32
        servicesUnscheduled:
          type: integer
          description: The number of services unscheduled for the week
          format: int32
        servicesAssigned:
          type: integer
          description: The number of services assigned for the week
          format: int32
        servicesAttempted:
          type: integer
          description: The number of services attempted for the week
          format: int32
        servicesCancelled:
          type: integer
          description: The number of services cancelled for the week
          format: int32
        servicesCompletedLate:
          type: integer
          description: The number of services completed late for the week
          format: int32
        servicesLateNotComplete:
          type: integer
          description: The number of services late and not complete for the week
          format: int32
        weekNumber:
          type: integer
          description: The ISO week number
          format: int32
        startsAt:
          type: string
          description: The first day of the week
          format: date
        endsAt:
          type: string
          description: The last day of the week
          format: date
      additionalProperties: false
tags:
  - name: Assets
    description: The physical assets installed at contact sites that may need
      regular servicing or reactive work
  - name: AuditTrails
    description: Audit trails for tracking changes and actions within the system
  - name: Categories
    description: The categories that can assets can be associated to, relative to a industry
  - name: FilePaths
    description: Endpoints to support the uploading of files
  - name: Jobs
    description: Create jobs from due services, aka CJFDS
  - name: ServiceAgreements
    description: The service agreements defined at contact sites that entail
      servicing details such as intervals
  - name: ServiceAttempts
    description: The service attempts defined for services.