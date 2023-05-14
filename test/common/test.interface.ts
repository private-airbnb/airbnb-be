export type RequestType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IRestRequest {
  method: RequestType;
  url: string;
  body?: any;
  authToken?: string;
}

export interface IGraphQLRequest {
  query: string;
  authToken?: string;
}
