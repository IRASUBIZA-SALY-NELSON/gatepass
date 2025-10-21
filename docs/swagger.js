export default {
    openapi: '3.0.0',
    info: {
        title: 'Gatepass Auth Backend API',
        version: '1.0.0',
        description: 'API for Gatepass Authentication and User Management',
    },
    servers: [
        {
            url: 'https://gatepass-o5mz.onrender.com',
            description: 'Production server',
        },
        {
            url: process.env.API_URL || 'http://localhost:5000',
            description: 'Development server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    role: { type: 'string', enum: ['admin', 'school', 'security'] },
                    schoolId: { type: 'string' },
                    isActive: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            School: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    apiUrl: { type: 'string', format: 'uri' },
                    apiKey: { type: 'string' },
                    studentDataMethod: { type: 'string', enum: ['api', 'csv'] },
                    isActive: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                },
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                },
            },
            RegisterRequest: {
                type: 'object',
                required: ['name', 'email', 'phone', 'password'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    password: { type: 'string', minLength: 8 },
                },
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
            VisitingDay: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    description: { type: 'string' },
                },
            },
            VisitingDayCreateRequest: {
                type: 'object',
                required: ['date'],
                properties: {
                    date: { type: 'string', format: 'date-time' },
                    description: { type: 'string', maxLength: 200 },
                },
            },
            VisitingDayUpdateRequest: {
                type: 'object',
                properties: {
                    date: { type: 'string', format: 'date-time' },
                    description: { type: 'string', maxLength: 200 },
                },
            },
            Visit: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    visitId: { type: 'string' },
                    schoolId: { type: 'string' },
                    parentId: { type: 'string' },
                    studentId: { type: 'string' },
                    status: { type: 'string', enum: ['pending_payment', 'confirmed', 'rejected', 'checked_in', 'cancelled'] },
                    visitDate: { type: 'string', format: 'date-time' },
                    approvalNotes: { type: 'string' },
                    reason: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            ApproveVisitRequest: {
                type: 'object',
                properties: { notes: { type: 'string', maxLength: 500 } },
            },
            RejectVisitRequest: {
                type: 'object',
                required: ['reason'],
                properties: { reason: { type: 'string', minLength: 3, maxLength: 500 } },
            },
            SettingsUpdateRequest: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    apiUrl: { type: 'string', format: 'uri' },
                    apiKey: { type: 'string' },
                    studentDataMethod: { type: 'string', enum: ['api', 'csv'] },
                },
            },
            AddSecurityUserRequest: {
                type: 'object',
                required: ['name', 'email', 'phone', 'password'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    password: { type: 'string', minLength: 8 },
                },
            },
            EditSchoolUserRequest: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                },
            },
            ChangePasswordRequest: {
                type: 'object',
                required: ['oldPassword', 'newPassword'],
                properties: {
                    oldPassword: { type: 'string' },
                    newPassword: { type: 'string', minLength: 8 },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' },
                    errors: { type: 'array', items: { type: 'string' } },
                },
            },
        },
        parameters: {
            PageParam: {
                name: 'page',
                in: 'query',
                description: 'Page number for pagination',
                required: false,
                schema: { type: 'integer', minimum: 1, default: 1 },
            },
            LimitParam: {
                name: 'limit',
                in: 'query',
                description: 'Number of items per page',
                required: false,
                schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
            SearchParam: {
                name: 'search',
                in: 'query',
                description: 'Search term for filtering',
                required: false,
                schema: { type: 'string' },
            },
            RoleParam: {
                name: 'role',
                in: 'query',
                description: 'Filter by user role',
                required: false,
                schema: { type: 'string', enum: ['admin', 'school', 'security'] },
            },
            StatusParam: {
                name: 'status',
                in: 'query',
                description: 'Filter by visit status',
                required: false,
                schema: { 
                    type: 'string', 
                    enum: ['pending_payment', 'confirmed', 'rejected', 'checked_in', 'cancelled'] 
                },
            },
            DateFromParam: {
                name: 'dateFrom',
                in: 'query',
                description: 'Filter visits from this date',
                required: false,
                schema: { type: 'string', format: 'date' },
            },
            DateToParam: {
                name: 'dateTo',
                in: 'query',
                description: 'Filter visits to this date',
                required: false,
                schema: { type: 'string', format: 'date' },
            },
            IdParam: {
                name: 'id',
                in: 'path',
                description: 'Resource ID',
                required: true,
                schema: { type: 'string' },
            },
        },
        responses: {
            BadRequest: {
                description: 'Bad Request',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            success: false,
                            message: 'Validation error',
                            errors: ['Field is required'],
                        },
                    },
                },
            },
            Unauthorized: {
                description: 'Unauthorized',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            success: false,
                            message: 'Not authorized: token missing',
                        },
                    },
                },
            },
            Forbidden: {
                description: 'Forbidden',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            success: false,
                            message: 'Forbidden: insufficient role',
                        },
                    },
                },
            },
            NotFound: {
                description: 'Not Found',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            success: false,
                            message: 'Resource not found',
                        },
                    },
                },
            },
            Conflict: {
                description: 'Conflict',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            success: false,
                            message: 'User already exists',
                        },
                    },
                },
            },
            TooManyRequests: {
                description: 'Too Many Requests',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' },
                        example: {
                            success: false,
                            message: 'Too many login attempts. Please try again later.',
                        },
                    },
                },
            },
        },
    },
    paths: {
        '/health': {
            get: {
                summary: 'Health Check',
                description: 'Check if the service is running',
                tags: ['System'],
                responses: {
                    '200': {
                        description: 'Service is healthy',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', example: 'ok' },
                                        service: { type: 'string', example: 'gatepass-auth' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/auth/register': {
            post: {
                summary: 'Register a new user',
                description: 'Register a new user account',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RegisterRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'User registered successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'User registered successfully' },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '409': { $ref: '#/components/responses/Conflict' },
                },
            },
        },
        '/api/auth/login': {
            post: {
                summary: 'Login user',
                description: 'Authenticate user and return JWT token',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginResponse' },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '429': { $ref: '#/components/responses/TooManyRequests' },
                },
            },
        },
        '/api/auth/me': {
            get: {
                summary: 'Get current user profile',
                description: 'Get the profile of the currently authenticated user',
                tags: ['Authentication'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'User profile retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                },
            },
        },
        '/api/users': {
            get: {
                summary: 'List users',
                description: 'Get a paginated list of users (admin only)',
                tags: ['User Management'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/PageParam' },
                    { $ref: '#/components/parameters/LimitParam' },
                    { $ref: '#/components/parameters/SearchParam' },
                    { $ref: '#/components/parameters/RoleParam' },
                ],
                responses: {
                    '200': {
                        description: 'Users retrieved successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PagedUsersResponse' },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/users/{id}': {
            get: {
                summary: 'Get user by ID',
                description: 'Get a specific user by ID (admin only)',
                tags: ['User Management'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: {
                    '200': {
                        description: 'User retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
            put: {
                summary: 'Update user',
                description: 'Update a user (admin only)',
                tags: ['User Management'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EditSchoolUserRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'User updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'User updated successfully' },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
            delete: {
                summary: 'Delete user',
                description: 'Delete a user (system admin only)',
                tags: ['User Management'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: {
                    '200': {
                        description: 'User deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'User deleted successfully' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
        },
        '/api/users/bulk-delete': {
            post: {
                summary: 'Bulk delete users',
                description: 'Delete multiple users at once (system admin only)',
                tags: ['User Management'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['userIds'],
                                properties: {
                                    userIds: {
                                        type: 'array',
                                        items: { type: 'string' },
                                        example: ['user1', 'user2', 'user3'],
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Users deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Users deleted successfully' },
                                        deletedCount: { type: 'integer', example: 3 },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/visiting-days': {
            post: {
                summary: 'Add visiting day',
                description: 'Add a new visiting day (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/VisitingDayCreateRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Visiting day added successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Visiting day added successfully' },
                                        visitingDay: { $ref: '#/components/schemas/VisitingDay' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
            get: {
                summary: 'List visiting days',
                description: 'Get all visiting days (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Visiting days retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        visitingDays: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/VisitingDay' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/visiting-days/{id}': {
            patch: {
                summary: 'Update visiting day',
                description: 'Update a visiting day (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/VisitingDayUpdateRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Visiting day updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Visiting day updated successfully' },
                                        visitingDay: { $ref: '#/components/schemas/VisitingDay' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
            delete: {
                summary: 'Delete visiting day',
                description: 'Delete a visiting day (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/IdParam' }],
                responses: {
                    '200': {
                        description: 'Visiting day deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Visiting day deleted successfully' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
        },
        '/api/schools/visits': {
            get: {
                summary: 'List visits',
                description: 'Get all visits with filtering and pagination (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/PageParam' },
                    { $ref: '#/components/parameters/LimitParam' },
                    { $ref: '#/components/parameters/StatusParam' },
                    { $ref: '#/components/parameters/DateFromParam' },
                    { $ref: '#/components/parameters/DateToParam' },
                ],
                responses: {
                    '200': {
                        description: 'Visits retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        page: { type: 'integer', example: 1 },
                                        limit: { type: 'integer', example: 10 },
                                        total: { type: 'integer', example: 25 },
                                        visits: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Visit' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/visits/pending': {
            get: {
                summary: 'List pending visits',
                description: 'Get all pending visits (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/PageParam' },
                    { $ref: '#/components/parameters/LimitParam' },
                ],
                responses: {
                    '200': {
                        description: 'Pending visits retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        page: { type: 'integer', example: 1 },
                                        limit: { type: 'integer', example: 10 },
                                        total: { type: 'integer', example: 5 },
                                        visits: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Visit' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/visits/{visitId}/approve': {
            patch: {
                summary: 'Approve visit',
                description: 'Approve a visit request (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'visitId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Visit ID',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ApproveVisitRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Visit approved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Visit approved successfully' },
                                        visit: { $ref: '#/components/schemas/Visit' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
        },
        '/api/schools/visits/{visitId}/reject': {
            patch: {
                summary: 'Reject visit',
                description: 'Reject a visit request (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'visitId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Visit ID',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RejectVisitRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Visit rejected successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Visit rejected successfully' },
                                        visit: { $ref: '#/components/schemas/Visit' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
        },
        '/api/schools/visits/stats': {
            get: {
                summary: 'Get visit statistics',
                description: 'Get visit statistics and analytics (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Statistics retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        stats: {
                                            type: 'object',
                                            properties: {
                                                total: { type: 'integer', example: 100 },
                                                pending: { type: 'integer', example: 5 },
                                                approved: { type: 'integer', example: 80 },
                                                rejected: { type: 'integer', example: 10 },
                                                checkedIn: { type: 'integer', example: 5 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/reports/visits': {
            get: {
                summary: 'Get visits report (JSON)',
                description: 'Get visits report in JSON format (school admin only)',
                tags: ['Reports'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/DateFromParam' },
                    { $ref: '#/components/parameters/DateToParam' },
                    { $ref: '#/components/parameters/StatusParam' },
                ],
                responses: {
                    '200': {
                        description: 'Report generated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        report: {
                                            type: 'object',
                                            properties: {
                                                summary: { type: 'object' },
                                                visits: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/Visit' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/reports/visits/pdf': {
            get: {
                summary: 'Get visits report (PDF)',
                description: 'Get visits report in PDF format (school admin only)',
                tags: ['Reports'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/DateFromParam' },
                    { $ref: '#/components/parameters/DateToParam' },
                    { $ref: '#/components/parameters/StatusParam' },
                ],
                responses: {
                    '200': {
                        description: 'PDF report generated successfully',
                        content: {
                            'application/pdf': {
                                schema: {
                                    type: 'string',
                                    format: 'binary',
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/settings': {
            patch: {
                summary: 'Update school settings',
                description: 'Update school settings and configuration (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/SettingsUpdateRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Settings updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Settings updated successfully' },
                                        school: { $ref: '#/components/schemas/School' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/student-data/upload': {
            post: {
                summary: 'Upload student data CSV',
                description: 'Upload student data from CSV file (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    file: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'CSV file containing student data',
                                    },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'CSV uploaded successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'CSV uploaded successfully' },
                                        recordsProcessed: { type: 'integer', example: 100 },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/api/test': {
            post: {
                summary: 'Test API connection',
                description: 'Test the school API connection (school admin only)',
                tags: ['School Management'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'API connection test successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'API connection successful' },
                                        data: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/users/security': {
            post: {
                summary: 'Add security user',
                description: 'Add a new security user (school admin only)',
                tags: ['User Management'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AddSecurityUserRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Security user added successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Security user added successfully' },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/users': {
            get: {
                summary: 'List school users',
                description: 'Get all users for the current school (school admin only)',
                tags: ['User Management'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Users retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        users: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/User' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/users/{userId}': {
            patch: {
                summary: 'Edit school user',
                description: 'Edit a school user (school admin only)',
                tags: ['User Management'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'userId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'User ID',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EditSchoolUserRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'User updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'User updated successfully' },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
            delete: {
                summary: 'Delete school user',
                description: 'Delete a school user (school admin only)',
                tags: ['User Management'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'userId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'User ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'User deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'User deleted successfully' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
        },
        '/api/schools/profile': {
            get: {
                summary: 'Get user profile',
                description: 'Get the current user profile (school admin only)',
                tags: ['Profile'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Profile retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
            patch: {
                summary: 'Update user profile',
                description: 'Update the current user profile (school admin only)',
                tags: ['Profile'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EditSchoolUserRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Profile updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Profile updated successfully' },
                                        user: { $ref: '#/components/schemas/User' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/password': {
            patch: {
                summary: 'Change password',
                description: 'Change the current user password (school admin only)',
                tags: ['Profile'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ChangePasswordRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Password changed successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Password changed successfully' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/schools/notifications': {
            get: {
                summary: 'List notifications',
                description: 'Get user notifications (school admin only)',
                tags: ['Notifications'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Notifications retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        notifications: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    _id: { type: 'string' },
                                                    message: { type: 'string' },
                                                    type: { type: 'string' },
                                                    read: { type: 'boolean' },
                                                    createdAt: { type: 'string', format: 'date-time' },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
    },
};