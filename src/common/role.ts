import { BaseModel } from "./base-model";

export class Role extends BaseModel {
  roleName: string;
  rolCode: string;
  description: string;
}
