import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Employee {
    _id:string,
    firstName:string,
    lastName:string,
    idCompany?: string,
    civilStatus:string,
    gender: string,
    address: string,
    station: string,
    mobile: string,
    email: string,
    photos: string,
    dateOfBirth: string,
    legalcard: string,
    username: string,
    groupId?:{
      _id?:string| null,
      groupName: string,
    },
    groupJoiningDate:string | null ,
    login: string,
    password:string,
    legalcardExtension: string,
    legalcardBase64String: string,
    photosBase64String: string,
    photosExtension: string,
    positionTitle:string,
    nationality:string,
    status:string,

}

export const employeeSlice = createApi({
  reducerPath: "Employee",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8800/employees/",
  }),
  tagTypes: ["Employee"],
  endpoints(builder) {
    return {
      fetchEmployee: builder.query<Employee[], number | void>({
        query() {
          return `/allEmployees`;
        },
        providesTags: ["Employee"],
      }),

      fetchEmployeeByCompany: builder.query<Employee[], { idCompany: string }>({
        query({ idCompany }) {
          return {
            url: `/getemployeesbyIdCompany`,
            method: "POST", 
            body: { idCompany }, 
          };
        },
        providesTags: ["Employee"],
      }),

      addEmployee: builder.mutation<void, Employee>({
        query(payload) {
          return {
            url: "/newEmployee",
            method: "POST",
            body: payload,
          };
        },
        invalidatesTags: ["Employee"],
      }),

      updateEmployee: builder.mutation<void, Employee>({
        query: ({ _id, ...rest }) => ({
          url: `/updateEmployee/${_id}`,
          method: "PUT",
          body: rest,
        }),
        invalidatesTags: ["Employee"],
      }),

      deleteEmployee: builder.mutation<void, number>({
        query: (_id) => ({
          url: `deleteEmployee/${_id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Employee"],
      }),
      removeEmployeeFromGroup : builder.mutation<void, { employeeId: string, groupId: string }>({
        query: ({ employeeId, groupId }) => ({
          url: `employees/${employeeId}/groups/${groupId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Employee'],
      }),

    };
  },
});

export const {
  useAddEmployeeMutation,
  useFetchEmployeeQuery,
  useDeleteEmployeeMutation,
  useUpdateEmployeeMutation,
  useFetchEmployeeByCompanyQuery,
  useRemoveEmployeeFromGroupMutation
} = employeeSlice;