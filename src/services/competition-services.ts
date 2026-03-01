import { endpoints } from "@/config";
import { api, APIResponse, Pagination } from "@/lib/api";
import type {
  Competition,
  CompetitionRegistrationAdmin,
  CompetitionRegistrationDetail,
} from "@/types";

export namespace CompetitionsService {
  export function getCompetitions() {
    return api.get<APIResponse<{ competitions: Competition[] }>>(
      endpoints.competitions.list.endpoint,
    );
  }

  export function getCompetitionRegistrations({
    page,
    limit,
    competitionSlug,
  }: {
    page: number;
    limit: number;
    competitionSlug?: string;
  }) {
    return api.get<
      APIResponse<{
        registrations: CompetitionRegistrationAdmin[];
        pagination: Pagination;
      }>
    >(endpoints.competitions.registrations.endpoint, {
      params: { page, limit, ...(competitionSlug ? { competitionSlug } : {}) },
    });
  }

  export function getCompetitionRegistrationById(id: string) {
    return api.get<
      APIResponse<{ registration: CompetitionRegistrationDetail }>
    >(`${endpoints.competitions.registrations.endpoint}/${id}`);
  }
}
