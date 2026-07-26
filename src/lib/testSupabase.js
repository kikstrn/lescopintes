import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Erreur Supabase :", error);
    return false;
  }

  console.log("Connexion Supabase opérationnelle :", data);
  return true;
}