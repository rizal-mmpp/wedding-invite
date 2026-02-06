import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export interface RSVPGuestRow {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  guest_slug: string | null;
  attendance: "attending" | "not_attending" | "pending";
  number_of_guests: number;
  message: string | null;
  created_at: string;
}

export interface GuestListRow {
  id: number;
  name: string;
  title: string | null;
  whatsapp: string;
  slug: string;
  invited: boolean;
  is_group: boolean;
  rsvp_status: "attending" | "not_attending" | "not_responded";
  message_sent: boolean;
  message_sent_at: string | null;
  rsvp_message: string | null;
  country: "Indonesia" | "Singapore" | "United States" | "Netherlands";
  language: "id" | "en";
  created_at: string;
  updated_at: string;
}

export async function getAllRSVPGuests(): Promise<RSVPGuestRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rsvp_guests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getRSVPGuestById(id: number): Promise<RSVPGuestRow | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rsvp_guests")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return undefined;
    throw error;
  }
  return data ?? undefined;
}

export async function createRSVPGuest(guest: {
  name: string;
  email?: string;
  phone?: string;
  guestSlug?: string;
  attendance: "attending" | "not_attending" | "pending";
  numberOfGuests?: number;
  message?: string;
}): Promise<RSVPGuestRow> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rsvp_guests")
    .insert({
      name: guest.name,
      email: guest.email ?? null,
      phone: guest.phone ?? null,
      guest_slug: guest.guestSlug ?? null,
      attendance: guest.attendance,
      number_of_guests: guest.numberOfGuests ?? 1,
      message: guest.message ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRSVPGuest(id: number): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rsvp_guests")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function deleteAllRSVPGuests(): Promise<number> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("rsvp_guests")
    .delete()
    .neq("id", 0)
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function getAllGuests(filters?: {
  invited?: boolean;
  messageSent?: boolean;
  rsvpStatus?: "attending" | "not_attending" | "not_responded";
}): Promise<GuestListRow[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from("guest_list").select("*").order("created_at", {
    ascending: false,
  });

  if (typeof filters?.invited === "boolean") {
    query = query.eq("invited", filters.invited);
  }
  if (typeof filters?.messageSent === "boolean") {
    query = query.eq("message_sent", filters.messageSent);
  }
  if (filters?.rsvpStatus) {
    query = query.eq("rsvp_status", filters.rsvpStatus);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export type GuestListFilters = {
  invited?: boolean;
  messageSent?: boolean;
  rsvpStatus?: "attending" | "not_attending" | "not_responded";
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "created_at" | "name";
  sortOrder?: "asc" | "desc";
};

type GuestQuery = ReturnType<
  ReturnType<typeof getSupabaseClient>["from"]
>["select"] extends (...args: any[]) => infer Result
  ? Result
  : never;

function applyGuestFilters(query: GuestQuery, filters?: GuestListFilters): GuestQuery {
  let nextQuery = query;
  if (typeof filters?.invited === "boolean") {
    nextQuery = nextQuery.eq("invited", filters.invited);
  }
  if (typeof filters?.messageSent === "boolean") {
    nextQuery = nextQuery.eq("message_sent", filters.messageSent);
  }
  if (filters?.rsvpStatus) {
    nextQuery = nextQuery.eq("rsvp_status", filters.rsvpStatus);
  }
  if (filters?.search) {
    nextQuery = nextQuery.ilike("name", `%${filters.search}%`);
  }
  return nextQuery;
}

export async function getGuestsPaged(filters?: GuestListFilters): Promise<{
  data: GuestListRow[];
  total: number;
}> {
  const supabase = getSupabaseClient();
  const sortBy = filters?.sortBy ?? "created_at";
  const sortOrder = filters?.sortOrder ?? "desc";
  let query = supabase
    .from("guest_list")
    .select("*", { count: "exact" })
    .order(sortBy, {
      ascending: sortOrder === "asc",
    });

  query = applyGuestFilters(query, filters);

  const page = Math.max(1, filters?.page ?? 1);
  const pageSize = Math.max(1, filters?.pageSize ?? 20);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0 };
}

export async function getGuestStats(filters?: GuestListFilters): Promise<{
  invited: number;
  messaged: number;
  attending: number;
  notResponded: number;
}> {
  const supabase = getSupabaseClient();
  const makeBaseQuery = () =>
    applyGuestFilters(
      supabase.from("guest_list").select("id", { count: "exact", head: true }),
      filters
    );

  const [invitedRes, messagedRes, attendingRes, notRespondedRes] = await Promise.all([
    makeBaseQuery().eq("invited", true),
    makeBaseQuery().eq("message_sent", true),
    makeBaseQuery().eq("rsvp_status", "attending"),
    makeBaseQuery().eq("rsvp_status", "not_responded"),
  ]);

  if (invitedRes.error) throw invitedRes.error;
  if (messagedRes.error) throw messagedRes.error;
  if (attendingRes.error) throw attendingRes.error;
  if (notRespondedRes.error) throw notRespondedRes.error;

  return {
    invited: invitedRes.count ?? 0,
    messaged: messagedRes.count ?? 0,
    attending: attendingRes.count ?? 0,
    notResponded: notRespondedRes.count ?? 0,
  };
}

export async function getGuestById(id: number): Promise<GuestListRow | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("guest_list")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return undefined;
    throw error;
  }
  return data ?? undefined;
}

export async function getGuestBySlug(slug: string): Promise<GuestListRow | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("guest_list")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) {
    if (error.code === "PGRST116") return undefined;
    throw error;
  }
  return data ?? undefined;
}

export async function createGuest(guest: {
  name: string;
  title?: string;
  whatsapp: string;
  slug: string;
  invited?: boolean;
  isGroup?: boolean;
  rsvpStatus?: "attending" | "not_attending" | "not_responded";
  country?: "Indonesia" | "Singapore" | "United States" | "Netherlands";
  language?: "id" | "en";
}): Promise<GuestListRow> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("guest_list")
    .insert({
      name: guest.name,
      title: guest.title ?? null,
      whatsapp: guest.whatsapp,
      slug: guest.slug,
      invited: guest.invited ?? false,
      is_group: guest.isGroup ?? false,
      rsvp_status: guest.rsvpStatus ?? "not_responded",
      message_sent: false,
      country: guest.country ?? "Indonesia",
      language: guest.language ?? "id",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateGuest(
  id: number,
  updates: {
    name?: string;
    title?: string | null;
    whatsapp?: string;
    slug?: string;
    invited?: boolean;
    isGroup?: boolean;
    rsvpStatus?: "attending" | "not_attending" | "not_responded";
    messageSent?: boolean;
    messageSentAt?: string | null;
    rsvpMessage?: string | null;
    country?: "Indonesia" | "Singapore" | "United States" | "Netherlands";
    language?: "id" | "en";
  }
): Promise<GuestListRow | undefined> {
  const fields: Record<string, unknown> = {};

  if (typeof updates.name === "string") fields.name = updates.name;
  if (updates.title !== undefined) fields.title = updates.title;
  if (typeof updates.whatsapp === "string") fields.whatsapp = updates.whatsapp;
  if (typeof updates.slug === "string") fields.slug = updates.slug;
  if (typeof updates.invited === "boolean") fields.invited = updates.invited;
  if (typeof updates.isGroup === "boolean") fields.is_group = updates.isGroup;
  if (updates.rsvpStatus) fields.rsvp_status = updates.rsvpStatus;
  if (typeof updates.messageSent === "boolean") fields.message_sent = updates.messageSent;
  if (updates.messageSentAt !== undefined) fields.message_sent_at = updates.messageSentAt;
  if (updates.rsvpMessage !== undefined) fields.rsvp_message = updates.rsvpMessage;
  if (updates.country) fields.country = updates.country;
  if (updates.language) fields.language = updates.language;

  if (!Object.keys(fields).length) {
    return getGuestById(id);
  }

  fields.updated_at = new Date().toISOString();

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("guest_list")
    .update(fields)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    if (error.code === "PGRST116") return undefined;
    throw error;
  }
  return data ?? undefined;
}

export async function updateGuestsMessageSent(
  ids: number[],
  messageSent: boolean,
  messageSentAt?: string | null
): Promise<GuestListRow[]> {
  if (!ids.length) return [];
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("guest_list")
    .update({
      message_sent: messageSent,
      message_sent_at: messageSentAt ?? null,
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .select("*");
  if (error) throw error;
  return data ?? [];
}

export async function deleteGuests(ids: number[]): Promise<number> {
  if (!ids.length) return 0;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("guest_list")
    .delete()
    .in("id", ids)
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function deleteGuest(id: number): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("guest_list")
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}
