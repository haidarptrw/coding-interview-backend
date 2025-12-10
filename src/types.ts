import { error } from "console";
import z from "zod";

export const shareBodySchema = z.object({
    id: z.string(),
    userIdTarget: z.string(),
})

export type ShareBody = z.infer<typeof shareBodySchema>;

export type ResponseBody = {
    message: string,
    data: any
}

export const ResponseBodyFactory = {
    new(message: string, data: any): ResponseBody {
        return {
            message,
            data
        }
    }
};

export type ResponseError = {
    message: string,
    status: number,
}

export const ResponseErrorFactory = {
    new(message: string, status: number): ResponseError {
        return {
            message,
            status
        }
    },

}

export const ResponseErrorModule = {
    toString(responseError: ResponseError) {
        return responseError.message;
    },
    parseFrom(data: any): Result<ResponseError, string> {
        if (!data.message || !data.status) {
            return err("Failed to parse. Invalid data");
        }

        return ok({ message: data.message, status: data.status });
    }
}

export type Result<T, E> = { ok: true, data: T } | { ok: false, error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });