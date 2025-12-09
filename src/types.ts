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