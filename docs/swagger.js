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
