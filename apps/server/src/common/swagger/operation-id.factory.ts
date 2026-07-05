export const swaggerOperationIdFactory = (
    controllerKey: string,
    methodKey: string,
) => `${controllerKey.replace(/Controller$/, '')}_${methodKey}`;
