import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://dtleskmrqtusfekwrmsk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_GCMe0MDqjp2pAwIl8OTNvw_Np9IPJ_I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function registrarUsuario(username, email, senha) {

  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password: senha
  });

  if (signupError) {
    throw new Error(signupError.message);
  }

  const user = signupData.user;
  if (!user) {
    throw new Error("Usuário não retornado após cadastro.");
  }

  const { error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          username: username,
          email: email
        }
      ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  return user;
}

export async function loginUsuario(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function logoutUsuario() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getUsuarioAtual() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
