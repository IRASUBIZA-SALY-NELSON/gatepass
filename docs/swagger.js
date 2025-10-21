const swaggerSpec = swaggerJSDoc({
    openapi: '3.0.3',
    info: {
        title: 'GatePass Auth API',
        version: '1.0.0',
        description: 'Authentication and authorization API for GatePass',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Local dev' }],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userType: { type: 'string', enum: ['parent', 'school_admin', 'security', 'system_admin'] },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    schoolId: { type: 'string', nullable: true },
                    linkedStudents: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            RegisterRequest: {
                type: 'object',
                required: ['userType', 'name', 'email', 'phone', 'password'],
                properties: {
                    userType: { type: 'string', enum: ['parent', 'school_admin', 'security', 'system_admin'] },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    password: { type: 'string', minLength: 8 },
                    schoolId: { type: 'string' },
                    linkedStudents: { type: 'array', items: { type: 'string' } },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['identifier', 'password'],
                properties: {
                    identifier: { type: 'string', description: 'email or phone' },
                    password: { type: 'string' },
                },
            },
            UpdateUserRequest: {
                type: 'object',
                properties: {
                    userType: { type: 'string', enum: ['parent', 'school_admin', 'security', 'system_admin'] },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    schoolId: { type: 'string', nullable: true },
                    linkedStudents: { type: 'array', items: { type: 'string' } },
                },
            },
            BulkDeleteRequest: {
                type: 'object',
                required: ['ids'],
                properties: { ids: { type: 'array', items: { type: 'string' } } },
            },
            PagedUsersResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    items: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                },
            },
        },
    },
    paths: {
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Register a new user',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
                },
                responses: {
                    201: { description: 'Created' },
                    400: { description: 'Validation error' },
                },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Login with email or phone and password',
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
                },
                responses: {
                    200: { description: 'OK' },
                    401: { description: 'Invalid credentials' },
                    429: { description: 'Too many attempts' },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get current user details',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
            },
        },
        '/api/users': {
            get: {
                tags: ['Users'],
                summary: 'List users (RBAC: system_admin, school_admin)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1 } },
                    { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100 } },
                    { in: 'query', name: 'userType', schema: { type: 'string', enum: ['parent', 'school_admin', 'security', 'system_admin'] } },
                ],
                responses: {
                    200: { description: 'OK' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Forbidden' },
                },
            },
        },
        '/api/users/{id}': {
            get: {
                tags: ['Users'],
                summary: 'Get user by id (RBAC: system_admin, school_admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'OK' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Forbidden' },
                    404: { description: 'Not Found' },
                },
            },
            put: {
                tags: ['Users'],
                summary: 'Update user (RBAC: system_admin, school_admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserRequest' } } },
                },
                responses: {
                    200: { description: 'OK' },
                    400: { description: 'Validation error' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Forbidden' },
                    404: { description: 'Not Found' },
                },
            },
            delete: {
                tags: ['Users'],
                summary: 'Delete user (RBAC: system_admin)',
                security: [{ bearerAuth: [] }],
                parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Deleted' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Forbidden' },
                    404: { description: 'Not Found' },
                },
            },
        },
        '/api/users/bulk-delete': {
            post: {
                tags: ['Users'],
                summary: 'Bulk delete users (RBAC: system_admin)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: { $ref: '#/components/schemas/BulkDeleteRequest' } } },
                },
                responses: {
                    200: { description: 'OK' },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Forbidden' },
                },
            },
        },
    },
});
