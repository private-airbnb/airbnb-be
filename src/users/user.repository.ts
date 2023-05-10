import { Injectable } from "@nestjs/common";
import { makeBaseRepository } from "../common/repositories/base.repository";
import { User } from "./entities/user.entity";

@Injectable()
export default class UserRepository extends makeBaseRepository(User) {}
