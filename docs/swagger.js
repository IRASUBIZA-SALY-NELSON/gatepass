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
                    200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PagedUsersResponse' } } } },
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
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'OK', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, user: { $ref: '#/components/schemas/User' } } } } } },
                    401: { description: 'Unauthorized' },
                    403: { description: 'Forbidden' },
                    404: { description: 'Not Found' },
                },
            },
            put: {
                tags: ['Users'],
                summary: 'Update user (RBAC: system_admin, school_admin)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
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
                parameters: [
                    { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
                ],
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
