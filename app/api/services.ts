import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: (import.meta as any).VITE_BASE_URL,
    prepareHeaders: (headers) => {
        headers.set("Content-Type", "application/json");
        return headers;
    },
    credentials: "include",
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        window.location.href = "/login";
    }

    return result;
};

export const api = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
        }),

        loadUser: builder.query({
            query: () => ({
                url: "/auth/load-user",
                method: "GET",
            }),
        }),

        // DEPARTMENTS
        getDepartments: builder.query({
            query: (params) => ({
                url: "/department/all",
                method: "GET",
                params,
            }),
        }),
        
    }),
});

export const {
    useLoginMutation,
    useGetDepartmentsQuery,
    useLoadUserQuery,
} = api;