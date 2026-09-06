// Interface for objektet som returneres når admin henter ut listen (GET /api/auth/admin/blacklist)
import {BlacklistType} from "@/lib/models/enums/BlacklistType";

export interface BlacklistedEntry {
  id: string;
  pattern: string;
  type: BlacklistType;
  reason?: string;
  createdAt: string;
  createdByAdminId: string;
}