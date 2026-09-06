import {BlacklistType} from "@/lib/models/enums/BlacklistType";

export interface AddBlacklistRequest {
  pattern: string;
  type: BlacklistType;
  reason?: string;
}