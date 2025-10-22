export default {
    openapi: '3.0.0',
    info: {
        title: 'Gatepass Smart Check-in System API',
        version: '2.0.0',
        description: 'Comprehensive API for Gatepass Smart Check-in and Visit Management System',
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
                    userType: { type: 'string', enum: ['parent', 'school_admin', 'security', 'system_admin'] },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    profileImage: { type: 'string' },
                    isActive: { type: 'boolean' },
                    lastLogin: { type: 'string', format: 'date-time' },
                    schoolId: { type: 'string' },
                    linkedStudents: { type: 'array', items: { type: 'string' } },
                    preferences: {
                        type: 'object',
                        properties: {
                            notifications: {
                                type: 'object',
                                properties: {
                                    email: { type: 'boolean' },
                                    sms: { type: 'boolean' },
                                    push: { type: 'boolean' }
                                }
                            },
                            language: { type: 'string' }
                        }
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            School: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    address: { type: 'string' },
                    phone: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    leader: { type: 'string' },
                    contactPerson: { type: 'string' },
                    contactPhone: { type: 'string' },
                    apiUrl: { type: 'string', format: 'uri' },
                    apiKey: { type: 'string' },
                    studentDataMethod: { type: 'string', enum: ['api', 'csv'] },
                    csvFilePath: { type: 'string' },
                    isActive: { type: 'boolean' },
                    settings: {
                        type: 'object',
                        properties: {
                            visitFee: { type: 'number' },
                            maxVisitorsPerVisit: { type: 'number' },
                            allowAdvanceBooking: { type: 'number' },
                            requireApproval: { type: 'boolean' }
                        }
                    },
                    visitingDays: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/VisitingDay' }
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
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
            Visit: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    parentId: { type: 'string' },
                    schoolId: { type: 'string' },
                    studentId: { type: 'string' },
                    studentName: { type: 'string' },
                    studentClass: { type: 'string' },
                    visitDate: { type: 'string', format: 'date-time' },
                    numVisitors: { type: 'number' },
                    status: { 
                        type: 'string', 
                        enum: ['pending_payment', 'confirmed', 'rejected', 'checked_in', 'cancelled'] 
                    },
                    reason: { type: 'string' },
                    visitId: { type: 'string' },
                    approvalNotes: { type: 'string' },
                    paymentId: { type: 'string' },
                    paymentStatus: { 
                        type: 'string', 
                        enum: ['pending', 'completed', 'failed', 'refunded'] 
                    },
                    amount: { type: 'number' },
                    qrCode: { type: 'string' },
                    checkInTime: { type: 'string', format: 'date-time' },
                    checkInBy: { type: 'string' },
                    visitorNames: { type: 'array', items: { type: 'string' } },
                    visitorPhones: { type: 'array', items: { type: 'string' } },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Payment: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    visitId: { type: 'string' },
                    parentId: { type: 'string' },
                    schoolId: { type: 'string' },
                    amount: { type: 'number' },
                    currency: { type: 'string' },
                    paymentMethod: { 
                        type: 'string', 
                        enum: ['momo', 'stripe', 'flutterwave', 'cash'] 
                    },
                    externalPaymentId: { type: 'string' },
                    status: { 
                        type: 'string', 
                        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'] 
                    },
                    transactionId: { type: 'string' },
                    phoneNumber: { type: 'string' },
                    paymentDetails: {
                        type: 'object',
                        properties: {
                            provider: { type: 'string' },
                            accountNumber: { type: 'string' },
                            reference: { type: 'string' }
                        }
                    },
                    processedAt: { type: 'string', format: 'date-time' },
                    refundedAt: { type: 'string', format: 'date-time' },
                    refundReason: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
            },
            Notification: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    userId: { type: 'string' },
                    type: { 
                        type: 'string', 
                        enum: [
                            'visit_approved', 'visit_rejected', 'visit_confirmed', 
                            'payment_success', 'payment_failed', 'visit_reminder',
                            'visit_cancelled', 'system_announcement'
                        ] 
                    },
                    title: { type: 'string' },
                    message: { type: 'string' },
                    data: { type: 'object' },
                    isRead: { type: 'boolean' },
                    readAt: { type: 'string', format: 'date-time' },
                    priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
                    channels: {
                        type: 'object',
                        properties: {
                            email: { type: 'boolean' },
                            sms: { type: 'boolean' },
                            push: { type: 'boolean' },
                            inApp: { type: 'boolean' }
                        }
                    },
                    sentAt: { type: 'string', format: 'date-time' },
                    expiresAt: { type: 'string', format: 'date-time' },
                    createdAt: { type: 'string', format: 'date-time' },
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
                required: ['name', 'email', 'phone', 'password', 'userType'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    password: { type: 'string', minLength: 8 },
                    userType: { type: 'string', enum: ['parent', 'school_admin', 'security', 'system_admin'] },
                    address: { type: 'string' },
                    schoolId: { type: 'string' },
                    linkedStudents: { type: 'array', items: { type: 'string' } },
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
            VisitRequest: {
                type: 'object',
                required: ['schoolId', 'studentId', 'visitDate'],
                properties: {
                    schoolId: { type: 'string' },
                    studentId: { type: 'string' },
                    visitDate: { type: 'string', format: 'date-time' },
                    numVisitors: { type: 'number', minimum: 1, maximum: 5 },
                    reason: { type: 'string', maxLength: 500 },
                    visitorNames: { type: 'array', items: { type: 'string' } },
                    visitorPhones: { type: 'array', items: { type: 'string' } },
                },
            },
            PaymentInitializeRequest: {
                type: 'object',
                required: ['paymentMethod'],
                properties: {
                    paymentMethod: { type: 'string', enum: ['momo', 'stripe', 'flutterwave'] },
                    phoneNumber: { type: 'string' },
                },
            },
            PaymentConfirmRequest: {
                type: 'object',
                required: ['externalPaymentId', 'status'],
                properties: {
                    externalPaymentId: { type: 'string' },
                    status: { type: 'string', enum: ['completed', 'failed'] },
                    transactionId: { type: 'string' },
                    amount: { type: 'number' },
                },
            },
            CheckInRequest: {
                type: 'object',
                properties: {
                    notes: { type: 'string', maxLength: 500 },
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
                    address: { type: 'string' },
                    phone: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    leader: { type: 'string' },
                    contactPerson: { type: 'string' },
                    contactPhone: { type: 'string' },
                    apiUrl: { type: 'string', format: 'uri' },
                    apiKey: { type: 'string' },
                    studentDataMethod: { type: 'string', enum: ['api', 'csv'] },
                    settings: {
                        type: 'object',
                        properties: {
                            visitFee: { type: 'number' },
                            maxVisitorsPerVisit: { type: 'number' },
                            allowAdvanceBooking: { type: 'number' },
                            requireApproval: { type: 'boolean' }
                        }
                    },
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
            EditUserRequest: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    address: { type: 'string' },
                    preferences: {
                        type: 'object',
                        properties: {
                            notifications: {
                                type: 'object',
                                properties: {
                                    email: { type: 'boolean' },
                                    sms: { type: 'boolean' },
                                    push: { type: 'boolean' }
                                }
                            },
                            language: { type: 'string' }
                        }
                    },
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
            PagedResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    items: { type: 'array', items: { type: 'object' } },
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
            UserTypeParam: {
                name: 'userType',
                in: 'query',
                description: 'Filter by user type',
                required: false,
                schema: { type: 'string', enum: ['parent', 'school_admin', 'security', 'system_admin'] },
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
                name: 'from',
                in: 'query',
                description: 'Filter visits from this date',
                required: false,
                schema: { type: 'string', format: 'date' },
            },
            DateToParam: {
                name: 'to',
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
            VisitIdParam: {
                name: 'visitId',
                in: 'path',
                description: 'Visit ID',
                required: true,
                schema: { type: 'string' },
            },
            SchoolIdParam: {
                name: 'schoolId',
                in: 'path',
                description: 'School ID',
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
        // Parent APIs
        '/api/parents/dashboard': {
            get: {
                summary: 'Get parent dashboard',
                description: 'Get parent dashboard with linked students and upcoming visits',
                tags: ['Parent'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Dashboard retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        parent: { $ref: '#/components/schemas/User' },
                                        school: { $ref: '#/components/schemas/School' },
                                        linkedStudents: { type: 'array', items: { type: 'string' } },
                                        upcomingVisits: { type: 'array', items: { $ref: '#/components/schemas/Visit' } },
                                        recentVisits: { type: 'array', items: { $ref: '#/components/schemas/Visit' } },
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
        '/api/parents/schools/{schoolId}/visiting-days': {
            get: {
                summary: 'Get available visiting days',
                description: 'Get available visiting days for a specific school',
                tags: ['Parent'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/SchoolIdParam' }],
                responses: {
                    '200': {
                        description: 'Visiting days retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        visitingDays: { type: 'array', items: { $ref: '#/components/schemas/VisitingDay' } },
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
        '/api/parents/visits': {
            post: {
                summary: 'Request a visit',
                description: 'Request a new visit to a school',
                tags: ['Parent'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/VisitRequest' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Visit request created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Visit request created successfully' },
                                        visit: { $ref: '#/components/schemas/Visit' },
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
                summary: 'Get parent visits',
                description: 'Get all visits for the current parent',
                tags: ['Parent'],
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
                                schema: { $ref: '#/components/schemas/PagedResponse' },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/parents/visits/{visitId}': {
            get: {
                summary: 'Get visit details',
                description: 'Get detailed information about a specific visit',
                tags: ['Parent'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/VisitIdParam' }],
                responses: {
                    '200': {
                        description: 'Visit details retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        visit: { $ref: '#/components/schemas/Visit' },
                                        payment: { $ref: '#/components/schemas/Payment' },
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
            patch: {
                summary: 'Cancel visit',
                description: 'Cancel a visit request',
                tags: ['Parent'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/VisitIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    reason: { type: 'string', maxLength: 500 },
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Visit cancelled successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Visit cancelled successfully' },
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
        '/api/parents/visits/{visitId}/qr': {
            get: {
                summary: 'Generate visit QR code',
                description: 'Generate QR code for gate verification',
                tags: ['Parent'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/VisitIdParam' }],
                responses: {
                    '200': {
                        description: 'QR code generated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        qrCode: { type: 'string' },
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
        '/api/parents/notifications': {
            get: {
                summary: 'Get parent notifications',
                description: 'Get notifications for the current parent',
                tags: ['Parent'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/PageParam' },
                    { $ref: '#/components/parameters/LimitParam' },
                    {
                        name: 'unreadOnly',
                        in: 'query',
                        description: 'Show only unread notifications',
                        required: false,
                        schema: { type: 'boolean', default: false },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Notifications retrieved successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PagedResponse' },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/parents/notifications/{notificationId}/read': {
            patch: {
                summary: 'Mark notification as read',
                description: 'Mark a notification as read',
                tags: ['Parent'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'notificationId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Notification ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Notification marked as read',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        notification: { $ref: '#/components/schemas/Notification' },
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
        '/api/parents/profile': {
            patch: {
                summary: 'Update parent profile',
                description: 'Update parent profile information',
                tags: ['Parent'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EditUserRequest' },
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
                                        parent: { $ref: '#/components/schemas/User' },
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
        // Payment APIs
        '/api/payments/visits/{visitId}/initialize': {
            post: {
                summary: 'Initialize payment',
                description: 'Initialize payment for a visit',
                tags: ['Payments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/VisitIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/PaymentInitializeRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Payment initialized successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Payment initialized successfully' },
                                        payment: { $ref: '#/components/schemas/Payment' },
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
        '/api/payments/webhook/confirm': {
            post: {
                summary: 'Confirm payment (Webhook)',
                description: 'Webhook endpoint for payment confirmation from payment providers',
                tags: ['Payments'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/PaymentConfirmRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Payment status updated',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Payment status updated' },
                                        payment: { $ref: '#/components/schemas/Payment' },
                                    },
                                },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/BadRequest' },
                    '404': { $ref: '#/components/responses/NotFound' },
                },
            },
        },
        '/api/payments/visits/{visitId}/status': {
            get: {
                summary: 'Get payment status',
                description: 'Get payment status for a visit',
                tags: ['Payments'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/VisitIdParam' }],
                responses: {
                    '200': {
                        description: 'Payment status retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        payment: { $ref: '#/components/schemas/Payment' },
                                        visit: { $ref: '#/components/schemas/Visit' },
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
        '/api/payments/history': {
            get: {
                summary: 'Get payment history',
                description: 'Get payment history for the current user',
                tags: ['Payments'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/PageParam' },
                    { $ref: '#/components/parameters/LimitParam' },
                    {
                        name: 'status',
                        in: 'query',
                        description: 'Filter by payment status',
                        required: false,
                        schema: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Payment history retrieved successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PagedResponse' },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        // Gate/Security APIs
        '/api/gate/dashboard': {
            get: {
                summary: 'Get security dashboard',
                description: 'Get security dashboard with today\'s visits and statistics',
                tags: ['Gate/Security'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Dashboard retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        stats: { type: 'object' },
                                        upcomingVisits: { type: 'array', items: { $ref: '#/components/schemas/Visit' } },
                                        recentCheckIns: { type: 'array', items: { $ref: '#/components/schemas/Visit' } },
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
        '/api/gate/visits/{visitId}/verify': {
            get: {
                summary: 'Verify visit by ID',
                description: 'Verify a visit by Visit ID for gate verification',
                tags: ['Gate/Security'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/VisitIdParam' }],
                responses: {
                    '200': {
                        description: 'Visit verification result',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        visit: { $ref: '#/components/schemas/Visit' },
                                        payment: { $ref: '#/components/schemas/Payment' },
                                        isValid: { type: 'boolean' },
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
        '/api/gate/visits/{visitId}/checkin': {
            patch: {
                summary: 'Check in visitor',
                description: 'Check in a visitor at the gate',
                tags: ['Gate/Security'],
                security: [{ bearerAuth: [] }],
                parameters: [{ $ref: '#/components/parameters/VisitIdParam' }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CheckInRequest' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Visitor checked in successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Visitor checked in successfully' },
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
        '/api/gate/visits/today': {
            get: {
                summary: 'Get today\'s visits',
                description: 'Get all visits for today',
                tags: ['Gate/Security'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { $ref: '#/components/parameters/PageParam' },
                    { $ref: '#/components/parameters/LimitParam' },
                    { $ref: '#/components/parameters/StatusParam' },
                ],
                responses: {
                    '200': {
                        description: 'Today\'s visits retrieved successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PagedResponse' },
                            },
                        },
                    },
                    '401': { $ref: '#/components/responses/Unauthorized' },
                    '403': { $ref: '#/components/responses/Forbidden' },
                },
            },
        },
        '/api/gate/stats/today': {
            get: {
                summary: 'Get today\'s statistics',
                description: 'Get visit statistics for today',
                tags: ['Gate/Security'],
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
                                        stats: { type: 'object' },
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
        '/api/gate/search': {
            get: {
                summary: 'Search visitors',
                description: 'Search visitors by name or phone number',
                tags: ['Gate/Security'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    {
                        name: 'q',
                        in: 'query',
                        description: 'Search query',
                        required: true,
                        schema: { type: 'string', minLength: 2 },
                    },
                    {
                        name: 'date',
                        in: 'query',
                        description: 'Search date (default: today)',
                        required: false,
                        schema: { type: 'string', format: 'date' },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Search results retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        visits: { type: 'array', items: { $ref: '#/components/schemas/Visit' } },
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
        // School Management APIs (existing enhanced)
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
                                schema: { $ref: '#/components/schemas/PagedResponse' },
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
                                schema: { $ref: '#/components/schemas/PagedResponse' },
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
                parameters: [{ $ref: '#/components/parameters/VisitIdParam' }],
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
                parameters: [{ $ref: '#/components/parameters/VisitIdParam' }],
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
                                        stats: { type: 'object' },
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
                                schema: { $ref: '#/components/schemas/PagedResponse' },
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
                            schema: { $ref: '#/components/schemas/EditUserRequest' },
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
                            schema: { $ref: '#/components/schemas/EditUserRequest' },
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
                                            items: { $ref: '#/components/schemas/Notification' },
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
        // System Admin APIs
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
                    { $ref: '#/components/parameters/UserTypeParam' },
                ],
                responses: {
                    '200': {
                        description: 'Users retrieved successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PagedResponse' },
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
                            schema: { $ref: '#/components/schemas/EditUserRequest' },
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
    },
};