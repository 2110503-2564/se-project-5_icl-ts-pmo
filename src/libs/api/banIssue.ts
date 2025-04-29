import { Session } from "next-auth";
import { BanAppealType, BanIssueType, CommentType, UserType } from "../types";
import { revalidateTag } from "next/cache";
import { appeadSearch } from "./utils";

type BanIssuesResponse = {
  success: true;
  total: number;
  count: number;
  data: (Omit<Omit<BanIssueType, "user">, "admin"> & { user: UserType; admin: UserType })[];
};
type BanIssueResponse = { success: true; data: BanIssueType } | { success: false };
type BanAppealResponse = { success: true; data: BanAppealType } | { success: false };

/**
 * @cacheTag `banIssues`
 */
export async function getActiveBanIssuesAPI(
  session: Session,
  query: { page?: number; limit?: number; search?: string } = {}
): Promise<BanIssuesResponse> {
  return (await fetch(`${process.env.API_URL}/banIssues/${appeadSearch(query)}`, {
    method: "GET",
    headers: { authorization: `Bearer ${session.user.token}` },
    next: { tags: ["banIssues"], revalidate: 120 },
  }).then((e) => e.json())) as BanIssuesResponse;
}

/**
 * @cacheTag `banIssues`
 */
export async function getUserBanIssuesAPI(
  id: string,
  session: Session,
  query: { page?: number; limit?: number; search?: string } = {}
): Promise<BanIssuesResponse> {
  return (await fetch(`${process.env.API_URL}/banIssues/user/${id}${appeadSearch(query)}`, {
    method: "GET",
    headers: { authorization: `Bearer ${session.user.token}` },
    next: { tags: ["banIssues"], revalidate: 120 },
  }).then((e) => e.json())) as BanIssuesResponse;
}

/**
 * @cacheTag `banIssues-${id}`
 */
export async function getBanIssueAPI(id: string, session: Session) {
  return (await fetch(`${process.env.API_URL}/banIssues/${id}`, {
    method: "GET",
    headers: { authorization: `Bearer ${session.user.token}` },
    next: { tags: [`banIssues-${id}`], revalidate: 300 },
  }).then((e) => e.json())) as
    | {
        success: true;
        data: {
          banIssue: Omit<Omit<BanIssueType, "user">, "admin"> & { user: UserType; admin: UserType };
          banAppeals: Omit<BanAppealType, "comment">[];
        };
      }
    | { success: false };
}

/**
 * @cacheTag `banAppeals`
 */
export async function getBanAppealsAPI(
  session: Session,
  query: { page?: number; limit?: number; search?: string } = {}
) {
  return (await fetch(`${process.env.API_URL}/banAppeals${appeadSearch(query)}`, {
    method: "GET",
    headers: { authorization: `Bearer ${session.user.token}` },
    next: { tags: ["banAppeals"], revalidate: 300 },
  }).then((e) => e.json())) as {
    success: true;
    data: (Omit<Omit<BanAppealType, "comment">, "banIssue"> & {
      banIssue: Omit<BanIssueType, "user"> & { user: UserType };
    })[];
    count: number;
    total: number;
  };
}

/**
 * @cacheTag `banIssues-${id}` `banAppeals-${appeal}`
 */
export async function getBanAppealAPI(id: string, appeal: string, session: Session) {
  return (await fetch(`${process.env.API_URL}/banIssues/${id}/${appeal}`, {
    method: "GET",
    headers: { authorization: `Bearer ${session.user.token}` },
    next: { tags: [`banIssues-${id}`, `banAppeals-${appeal}`], revalidate: 600 },
  }).then((e) => e.json())) as
    | {
        success: true;
        data: Omit<Omit<BanAppealType, "banIssue">, "comment"> & {
          banIssue: BanIssueType;
          comment: (Omit<CommentType, "user"> & { user: UserType })[];
        };
      }
    | { success: false };
}

/**
 * @revalidateTag `banIssues`
 */
export async function createBanIssueAPI(
  id: string,
  payload: Partial<BanIssueType>,
  session: Session
): Promise<BanIssueResponse> {
  try {
    const response = (await fetch(`${process.env.API_URL}/banIssues/user/${id}`, {
      method: "POST",
      headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-cache",
    }).then((e) => e.json())) as BanIssueResponse;
    if (response.success) {
      revalidateTag("banIssues");
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

/**
 * @revalidateTag `banIssues` `banIssues-${id}`
 */
export async function resolveBanIssueAPI(id: string, session: Session): Promise<BanIssueResponse> {
  try {
    const response = (await fetch(`${process.env.API_URL}/banIssues/${id}`, {
      method: "PUT",
      headers: { authorization: `Bearer ${session.user.token}` },
      cache: "no-cache",
    }).then((e) => e.json())) as BanIssueResponse;
    if (response.success) {
      revalidateTag("banIssues");
      revalidateTag(`banIssues-${id}`);
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

/**
 * @revalidateTag `banAppeals` `banIssues-${id}`
 */
export async function createBanAppealAPI(
  id: string,
  payload: Partial<BanAppealType>,
  session: Session
): Promise<BanAppealResponse> {
  try {
    const response = (await fetch(`${process.env.API_URL}/banIssues/${id}`, {
      method: "POST",
      headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-cache",
    }).then((e) => e.json())) as BanAppealResponse;
    if (response.success) {
      revalidateTag(`banAppeals`);
      revalidateTag(`banIssues-${id}`);
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

/**
 * @revalidateTag `banAppeals-${appeal}`
 */
export async function createBanAppealCommentAPI(
  id: string,
  appeal: string,
  payload: Partial<CommentType>,
  session: Session
): Promise<BanAppealResponse> {
  try {
    const response = (await fetch(`${process.env.API_URL}/banIssues/${id}/${appeal}`, {
      method: "POST",
      headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-cache",
    }).then((e) => e.json())) as BanAppealResponse;
    if (response.success) {
      revalidateTag(`banAppeals-${appeal}`);
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}

/**
 * @revalidateTag `banIssues` `banIssues-${id}` `banAppeals-${appeal}`
 */
export async function updateBanAppealAPI(
  id: string,
  appeal: string,
  payload: Partial<BanAppealType>,
  session: Session
): Promise<BanAppealResponse> {
  try {
    const response = (await fetch(`${process.env.API_URL}/banIssues/${id}/${appeal}`, {
      method: "PUT",
      headers: { authorization: `Bearer ${session.user.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-cache",
    }).then((e) => e.json())) as BanAppealResponse;
    if (response.success) {
      if (response.data.resolveStatus == "resolved") revalidateTag("banIssues");
      revalidateTag(`banIssues-${id}`);
      revalidateTag(`banAppeals-${appeal}`);
    }
    return response;
  } catch (error) {
    console.error(error);
  }
  return { success: false };
}
