## 插入初始数据

直接运行dataInit.js，其会读取data.json并插入

## API

### User

#### 用户注册

- **URL**: `/api/user/register`
- **方法**: `POST`
- **描述**: 允许新用户注册。
- **请求体**:
    ```json5
    {
    "username": "string", // 用户名
    "password": "string", // 密码
    "avatar_url": "string" // 头像URL（可选）
    }
    ```
- **响应**:
    - **201 Created**: 注册成功
      ```json5
      {
        "id": "userId" // 用户ID
      }
      ```
    - **400 Bad Request**: 请求数据不完整或用户名已存在
      ```json5
      {
        "message": "错误信息",
        "code": 4000 // 表示缺项，或4001表示用户名已存在
      }
      ```

#### 用户登录

- **URL**: `/api/user/login`
- **方法**: `POST`
- **描述**: 允许用户登录。
- **请求体**:
  ```json5
  {
    "username": "string", // 用户名
    "password": "string" // 密码
  }
  ```
- **响应**:
    - **200 OK**: 登录成功
      ```json5
      {
        "auth": true,
        "token": "jwtToken", // JWT令牌
        "avatar_url": "string", // 头像URL
        "role": "string", // 用户角色 normal | admin | reviewer
        "id": "userId" // 用户ID
      }
      ```
    - **401 Unauthorized**: 无效的用户名或密码
      ```json
      {
        "auth": false,
        "token": null,
        "message": "Invalid username or password.",
        "code": 4011
      }
      ```

注意登陆成功后，应保存JWT令牌，以便在后续请求中使用。后续许多请求都需要在请求头中添加 jwt 令牌。所有缺少令牌或令牌不正确的请求将返回401状态码。而令牌对应的用户角色将决定用户在系统中的权限，权限不足的请求将返回403状态码。

#### 查询用户信息

- **URL**: `/api/user/:id`
- **方法**: `GET`
- **描述**: 根据用户ID查询用户信息。
- **响应**:
    - **200 OK**: 请求成功
      ```json5
      {
        "id": "userId",
        "username": "string",
        "avatar_url": "string",
        "role": "string" // 用户角色 normal | admin | reviewer
        }
        ```

### Upload

在上面的基础上，添加图片上传的API文档如下：

### Upload

#### 上传图片

- **URL**: `/api/upload/image`
- **方法**: `POST`
- **描述**: 允许用户上传图片。需要在请求头中添加JWT令牌进行认证。
- **请求体**:
    - 需要使用`multipart/form-data`格式上传文件，其中文件字段名为`image`。一次只能上传一张图片。
- **请求头**:（所有需要jwt令牌的请求都需要在请求头中添加jwt令牌，后略）
  ```plaintext
  Authorization: <JWT令牌>
  ```
- **响应**:
    - **200 OK**: 上传成功
      ```json5
      {
        "imageUrl": "string" // 上传图片的URL
      }
      ```

**注意**:
- 上传的图片会被保存在服务器的`public/upload/`目录下。
- 返回的`imageUrl`是图片在服务器上的访问URL，可以直接在浏览器中访问或在应用中使用。
- 需要在请求头中携带有效的JWT令牌，以通过身份验证。

在上传头像或者正式上传带有图片的文章时，应该先调用上传图片的API，然后再将返回的图片URL附加到后续的请求中。

### Article

#### 创建文章

- **URL**: `/api/article/`
- **方法**: `POST`
- **描述**: 允许所有登录用户创建文章。文章默认状态为待审核（`pending`）。
- **请求体**:
    ```json5
    {
      "title": "string", // 文章标题
      "content": "string", // 文章内容
      "imageUrls": ["string"], // 文章图片URL数组（可选）
      "location": "string" // 文章地点（可选）
    }
    ```
- **响应**:
    - **201 Created**: 创建成功
      ```json5
      {
        "articleId": "articleId" // 文章ID
      }
      ```
      没有判空机制。文章的创建时间会自动取当前时间。

#### 获取个人文章列表

- **URL**: `/api/article&page=<页数>&pageSize=<每页大小>&status=<文章状态>&keyword=<关键词>
- **方法**: `GET`
- **描述**: 返回当前登录用户的文章列表。可进行筛选和分页。页数从1开始。比如pagesize=10&page=1，表示获取数据条目1-10（这也是默认值）。之后所有列表相关的请求都会有这个参数。后略。
- **响应**:
    - **200 OK**: 请求成功
      ```json5
      {
      "total": "number", // 总文章数  
      "articles": [
          {
            "id": "articleId",
            "title": "string",
            "content": "string",
            // 其他文章字段
            // 文章发布者的用户的信息
          }
          // 更多文章...
        ]
      }
      ```

#### 获取单篇文章详情

- **URL**: `/api/article/:id`
- **方法**: `GET`
- **描述**: 根据文章ID获取文章详细信息。若已经通过审核则任何人可查看，否则只有文章拥有者、管理员或审核员，或者文章已经通过审核的情况下才能查看。
- **响应**:
    - **200 OK**: 请求成功
      ```json5
      {
        "article": {
          "id": "articleId",
          "title": "string",
          "content": "string",
          // 其他文章字段
        }
      }
      ```
    - **404 Not Found**: 文章不存在或无权查看

#### 更新文章

- **URL**: `/api/article/:id`
- **方法**: `PUT`
- **描述**: 允许文章的拥有者更新自己的文章内容。更新后的文章需要重新审核，状态变为待审核。
- **请求体**:
    ```json5
    {
      "title": "string", // 新的文章标题
      "content": "string", // 新的文章内容
      "imageUrls": ["string"], // 新的文章图片URL数组（可选）
      "location": "string" // 新的文章地点（可选）
    }
    ```
- **响应**:
    - **200 OK**: 更新成功
      ```json5
      {
        "message": "Article updated."
      }
      ```

#### 删除文章

- **URL**: `/api/article/:id`
- **方法**: `DELETE`
- **描述**: 允许文章的拥有者删除自己的文章。实际上是将文章标记为删除，而不是从数据库中彻底删除。
- **响应**:
    - **200 OK**: 删除成功
      ```json5
      {
        "message": "Article deleted."
      }
      ```

#### 获取已通过审核的文章列表

- **URL**: `/api/article/approved`
- **方法**: `GET`
- **描述**: 任何人都可以查看已通过审核的文章列表。
- **响应**:
    - **200 OK**: 请求成功
      ```json5
      {
        "articles": [
          {
            "id": "articleId",
            "title": "string",
            "content": "string",
            // 其他文章字段
          }
          // 更多文章...
        ]
      }
      ```
      
#### 获取任何状态的文章列表
- **URL**: `/api/article/all`
- **方法**: `GET`
- **描述**: 仅管理员和审核员可以查看所有文章列表，包括待审核、已通过和已拒绝的文章。
- **响应**:
    - **200 OK**: 请求成功
      ```json5
      {
        "articles": [
          {
            "id": "articleId",
            "title": "string",
            "content": "string",
            // 其他文章字段
          }
          // 更多文章...
        ]
      }
      ```

#### 审核文章

- **URL**: `/api/article/:id/approve`
- **方法**: `PUT`
- **描述**: 允许管理员和审核员审核文章，修改状态。可以通过或拒绝文章的发布。
- **请求体**:
    ```json5
    {
      "status": "approved", // 或 "rejected"
      "rejectReason": "string" // 拒绝原因（仅在拒绝时提供）
    }
    ```
- **响应**:
    - **200 OK**: 审核操作成功
      ```json5
      {
        "message": "Article approved."
      }
      ```

#### 彻底删除文章

- **URL**: `/api/article/:id/true`
- **方法**: `DELETE`
- **描述**: 仅管理员可以彻底删除文章，从数据库中移除。
- **响应**:
    - **200 OK**: 删除成功
      ```json5
      {
        "message": "Article truly deleted."
      }
      ```
