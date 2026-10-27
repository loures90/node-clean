const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Signup API',
    version: '1.0.0',
    description: 'API for authenticating accounts.',
  },
  paths: {
    '/api/login': {
      post: {
        summary: 'Authenticate an account',
        description:
          'Validates the account credentials and returns an access token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'user@example.com',
                  },
                  password: {
                    type: 'string',
                    minLength: 1,
                    format: 'password',
                    writeOnly: true,
                    example: 'password123',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Account authenticated successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['accessToken', 'name'],
                  properties: {
                    accessToken: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'The request contains missing or invalid fields.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['message'],
                  properties: {
                    message: {
                      type: 'string',
                      enum: [
                        'email is required',
                        'password is required',
                        'email is invalid',
                      ],
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'The email or password is incorrect.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['message'],
                  properties: {
                    message: { type: 'string', example: 'Invalid credentials' },
                  },
                },
              },
            },
          },
          '500': {
            description: 'An unexpected internal error occurred.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['message'],
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Internal server error',
                    },
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

export default openApiDocument;
