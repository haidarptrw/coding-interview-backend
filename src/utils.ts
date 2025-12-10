import {ResponseError, ResponseErrorFactory, ResponseErrorModule } from "./types";

export function parseErrorToResponsePayload(data: any ): ResponseError {
    const parseResult = ResponseErrorModule.parseFrom(data);
    if (!parseResult.ok) {
        // check if it is an Error type
        if (data instanceof Error) {
            return ResponseErrorFactory.new(data.message, 400); // Idk what status code for this, so I use 400 Bad Request as placeholder
        } else {
            return ResponseErrorFactory.new("Unknown Error", 500);
        }
    }

    return parseResult.data;
}