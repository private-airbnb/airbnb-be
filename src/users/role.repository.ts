import { Injectable } from "@nestjs/common";
import { makeBaseRepository } from "../common/repositories/base.repository";
import { Role } from "./entities/role.entity";

@Injectable()
export default class RoleRepository extends makeBaseRepository(Role) {}
