export interface Competition {
  id: string;
  slug: string;
  name: string;
  isIndividualOnly: boolean;
}

export interface CompetitionRegistrationAdmin {
  id: string;
  competitionId: string;
  competitionSlug: string;
  competitionName: string;
  teamName: string | null;
  createdByUserId: string;
  createdAt: string;
  leaderEmail: string;
  leaderFirstName: string;
  leaderLastName: string | null;
  leaderEsummitId: string | null;
  memberCount: number;
}

export interface CompetitionRegistrationMember {
  position: number | null;
  userId: string;
  email: string;
  firstName: string;
  lastName: string | null;
  esummitId: string | null;
}

export interface CompetitionRegistrationDetail
  extends Omit<CompetitionRegistrationAdmin, "memberCount"> {
  members: CompetitionRegistrationMember[];
}
