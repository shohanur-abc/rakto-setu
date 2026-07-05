import { applyDecorators, type Type } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiExtraModels,
    ApiOperation,
    ApiResponse,
    getSchemaPath,
} from '@nestjs/swagger';
import { PageMetaDto } from '../dto/api-response.dto';

type OpenApiSchema = Record<string, unknown>;

type ApiRouteOptions = {
    summary: string;
    status?: number;
    description?: string;
    auth?: boolean;
    forbidden?: boolean;
    notFound?: boolean;
    conflict?: boolean;
    tooManyRequests?: boolean;
    responseType?: Type<unknown>;
    responseIsArray?: boolean;
    paginated?: boolean;
    dataSchema?: OpenApiSchema;
    envelope?: boolean;
};

export const ApiRoute = ({
    summary,
    status = 200,
    description = 'Successful response',
    auth = true,
    forbidden = true,
    notFound = false,
    conflict = false,
    tooManyRequests = false,
    responseType,
    responseIsArray = false,
    paginated = false,
    dataSchema,
    envelope = true,
}: ApiRouteOptions) => {
    const models = [
        ...(responseType ? [responseType] : []),
        ...(paginated ? [PageMetaDto] : []),
    ];
    const responseSchema = makeResponseSchema({
        responseType,
        responseIsArray,
        paginated,
        dataSchema,
        envelope,
    });
    const decorators = [ApiOperation({ summary })];

    if (models.length > 0) {
        decorators.push(ApiExtraModels(...models));
    }

    decorators.push(
        ApiResponse({
            status,
            description,
            ...(responseSchema ? { schema: responseSchema } : {}),
        }),
        ApiResponse({
            status: 400,
            description: 'Validation or malformed request',
        }),
    );

    if (auth) {
        decorators.push(
            ApiBearerAuth(),
            ApiResponse({ status: 401, description: 'Unauthenticated' }),
        );
    }

    if (auth && forbidden) {
        decorators.push(ApiResponse({ status: 403, description: 'Forbidden' }));
    }

    if (notFound) {
        decorators.push(
            ApiResponse({ status: 404, description: 'Resource not found' }),
        );
    }

    if (conflict) {
        decorators.push(ApiResponse({ status: 409, description: 'Conflict' }));
    }

    if (tooManyRequests) {
        decorators.push(
            ApiResponse({ status: 429, description: 'Too many requests' }),
        );
    }

    decorators.push(
        ApiResponse({ status: 500, description: 'Unexpected server error' }),
    );

    return applyDecorators(...decorators);
};

type ResponseSchemaOptions = Pick<
    ApiRouteOptions,
    'responseType' | 'responseIsArray' | 'paginated' | 'dataSchema' | 'envelope'
>;

const makeResponseSchema = ({
    responseType,
    responseIsArray,
    paginated,
    dataSchema,
    envelope,
}: ResponseSchemaOptions): OpenApiSchema | undefined => {
    const resolvedDataSchema =
        dataSchema ??
        (paginated && responseType
            ? {
                  type: 'object',
                  required: ['items', 'meta'],
                  properties: {
                      items: {
                          type: 'array',
                          items: { $ref: getSchemaPath(responseType) },
                      },
                      meta: { $ref: getSchemaPath(PageMetaDto) },
                  },
              }
            : responseType
              ? responseIsArray
                  ? {
                        type: 'array',
                        items: { $ref: getSchemaPath(responseType) },
                    }
                  : { $ref: getSchemaPath(responseType) }
              : { type: 'object', additionalProperties: true });

    if (!envelope) {
        return resolvedDataSchema;
    }

    return {
        type: 'object',
        required: ['success', 'data', 'message', 'errors'],
        properties: {
            success: { type: 'boolean', example: true },
            data: resolvedDataSchema,
            message: { type: 'string', example: '' },
            errors: {
                type: 'array',
                items: { type: 'object', additionalProperties: true },
            },
        },
    };
};
