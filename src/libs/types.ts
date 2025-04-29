export type CommentType = { _id: string; user: string; text: string; createdAt: string };
export type BanAppealType = {
  _id: string;
  banIssue: string;
  description: string;
  createdAt: string;
  resolveStatus: "pending" | "denied" | "resolved";
  resolvedAt?: string;
  comment: Comment[];
};

export type BanIssueType = {
  _id: string;
  user: string;
  admin: string;
  title: string;
  description: string;
  createdAt: string;
  endDate: string;
  isResolved: boolean;
  resolvedAt?: string;
};

export type CoworkingSpaceType = {
  _id: string;
  name: string;
  description: string;
  address: string;
  province: string;
  district: string;
  subDistrict: string;
  postalcode: string;
  openTime: string;
  closeTime: string;
  tel: string;
  owner: string;
  picture?: string;
};

export type ReservationType = {
  _id: string;
  user: string;
  coworkingSpace: string;
  startDate: string;
  endDate: string;
  personCount: number;
  approvalStatus: "pending" | "canceled" | "approved" | "rejected";
  createdAt: string;
};

export type UserType = {
  _id: string;
  name: string;
  phone: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date;
};
