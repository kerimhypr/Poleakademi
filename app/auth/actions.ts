"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentials = z.object({ email: z.string().email("Geçerli bir e-posta girin."), password: z.string().min(8, "Şifre en az 8 karakter olmalı."), displayName: z.string().min(2).max(60).optional() });
export type AuthState = { error?: string; message?: string };
async function getOrigin() {
  const requestHeaders = await headers();
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}
export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.pick({ email: true, password: true }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient(); const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "E-posta veya şifre hatalı." }; redirect("/");
}
export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password"), displayName: formData.get("displayName") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient(); const { error } = await supabase.auth.signUp({ email: parsed.data.email, password: parsed.data.password, options: { emailRedirectTo: `${await getOrigin()}/auth/confirm?next=/`, data: { display_name: parsed.data.displayName } } });
  if (error) return { error: error.message }; return { message: "Hesap oluşturuldu. E-postanızı doğruladıktan sonra giriş yapabilirsiniz." };
}
export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/"); }
export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = z.string().email("Geçerli bir e-posta girin.").safeParse(formData.get("email"));
  if (!email.success) return { error: email.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, { redirectTo: `${await getOrigin()}/auth/confirm?next=/sifre-yenile` });
  return error ? { error: "İşlem tamamlanamadı." } : { message: "Hesap varsa, şifre yenileme bağlantısı e-postaya gönderildi." };
}
export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = z.string().min(8, "Şifre en az 8 karakter olmalı.").safeParse(formData.get("password"));
  if (!password.success) return { error: password.error.issues[0].message };
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Şifre yenileme oturumu geçersiz veya süresi dolmuş." };
  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { error: "Şifre güncellenemedi." }; redirect("/profil");
}
