export default {
    openapi: '3.0.0',
    info: {
        title: 'Gatepass Auth Backend API',
        version: '1.0.0',
        description: 'API for Gatepass Authentication and User Management',
    },
    servers: [
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
    },
    paths: {
        '/health': {
            get: {
                summary: 'Health Check',
                description: 'Check if the service is running',
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
    },
};