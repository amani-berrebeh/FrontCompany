import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Program {
  _id?: string;
  programName: string;
  origin_point: {
    placeName: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  stops: {
    id: string;
    address: string;
    time: string;
  }[];
  destination_point: {
    placeName: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  pickUp_date: string;
  droppOff_date: string;
  freeDays_date: string[];
  exceptDays: string[];
  recommanded_capacity: string;
  extra: string[];
  notes: string;
  dropOff_time: string;
  pickUp_Time: string;
  school_id?: string;
  company_id?:  string;
    
  unit_price?: string;
  total_price?: string;
  vehiculeType?: string;
  luggage?: string;
  journeyType?: string;
  program_status?: {
    status: string;
    date_status: string;
  }[];
  within_payment_days?: string;
  invoiceFrequency?: string;
  notes_for_client?: {
    msg: string;
    date: string;
    sender: string;
  }[];
}

export interface SendResponse {
  id: string;
  notes_for_client: {
    msg: string;
    date: string;
    sender: string;
  }[];
  unit_price: string;
  total_price: string;
  program_status: {
    status: string;
    date_status: string;
  }[];
  invoiceFrequency: string;
  within_payment_days?: string;
}

export interface ConvertTo {
  idProgram: String;
}

export interface ConvertToQuote {
  id_schedule: String;
}

export interface UpdateStatus {
  id: string;
  status: string;
}

export const programSlice = createApi({
  reducerPath: "program",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8800/programs",
  }),
  tagTypes: ["Program",
  "SendResponse",
  "ConvertTo",
  "ConvertToQuote",
  "UpdateStatus"],
  endpoints(builder) {
    return {
      fetchPrograms: builder.query<Program[], number | void>({
        query() {
          return `/getAllPrograms`;
        },
        providesTags: ["Program"],
      }),
      fetchProgrammById: builder.query<Program, string | void>({
        query: (_id) => ({
          url: `/getProgrammById/${_id}`,
          method: "GET",
        }),
        providesTags: ["Program"],
      }),
      addProgram: builder.mutation<void, Program>({
        query(payload) {
          return {
            url: "/newProgram",
            method: "POST",
            body: payload,
          };
        },
        invalidatesTags: ["Program"],
      }),
      sendResponse: builder.mutation<void, SendResponse>({
        query({
          id,
          notes_for_client,
          unit_price,
          total_price,
          program_status,
          invoiceFrequency,
          within_payment_days,
        }) {
          return {
            url: "/sendResponse",
            method: "POST",
            body: {
              id,
              notes_for_client,
              unit_price,
              total_price,
              program_status,
              invoiceFrequency,
              within_payment_days,
            },
          };
        },
        invalidatesTags: ["Program", "SendResponse"],
      }),
      convertToContract: builder.mutation<void, ConvertTo>({
        query({ idProgram }) {
          return {
            url: "/toContract",
            method: "POST",
            body: {
              idProgram,
            },
          };
        },
        invalidatesTags: ["Program", "ConvertTo"],
      }),
      convertToQuote: builder.mutation<void, ConvertToQuote>({
        query({ id_schedule }) {
          return {
            url: "/convertToQuote",
            method: "POST",
            body: {
              id_schedule,
            },
          };
        },
        invalidatesTags: ["Program", "ConvertToQuote"],
      }),
      updateStatus: builder.mutation<void, UpdateStatus>({
        query({ id, status }) {
          return {
            url: "/statusToConverted",
            method: "POST",
            body: {
              id,
              status,
            },
          };
        },
        invalidatesTags: ["Program", "UpdateStatus"],
      }),
      deleteProgram: builder.mutation<void, string>({
        query: (_id) => ({
          url: `/deleteProgram/${_id}`,
          method: "DELETE",
        }),
        invalidatesTags: ["Program"],
      }),
    };
  },
});

export const {
  useAddProgramMutation,
  useFetchProgramsQuery,
  useFetchProgrammByIdQuery,
  useSendResponseMutation,
  useConvertToContractMutation,
  useConvertToQuoteMutation,
  useDeleteProgramMutation,
  useUpdateStatusMutation,
} = programSlice;