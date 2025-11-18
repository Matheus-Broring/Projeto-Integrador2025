import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dtleskmrqtusfekwrmsk.supabase.co";
const SUPABASE_KEY = "sb_publishable_GCMe0MDqjp2pAwIl8OTNvw_Np9IPJ_I";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

// 🔹 Carregar usuário logado
(async function loadUser() {
    const { data } = await supabase.auth.getUser();
    currentUser = data.user;

    if (!currentUser) {
        alert("Você precisa estar logado para usar o chat.");
        window.location.href = "Login.html";
    }
})();

// 🔹 Função para adicionar mensagem no chat
function addMessage(message) {
    const div = document.createElement("div");

    const isMine = message.user_id === currentUser?.id;

    div.classList.add("message", isMine ? "my-message" : "other-message");

    div.innerHTML = `
        ${message.message}
        <div class="message-time">${new Date(message.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
    `;

    document.getElementById("chatMessages").appendChild(div);

    // scroll para o fim automaticamente
    const chat = document.getElementById("chatMessages");
    chat.scrollTop = chat.scrollHeight;
}

// 🔹 Carregar mensagens antigas
async function loadMessages() {
    const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

    if (data) data.forEach(addMessage);
}

loadMessages();

// 🔹 Receber mensagens em tempo real
supabase
    .channel("chat-realtime")
    .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => addMessage(payload.new)
    )
    .subscribe();

// 🔹 Enviar mensagem
document.getElementById("chatForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (text === "") return;

    await supabase.from("chat_messages").insert([
        {
            user_id: currentUser.id,
            message: text,
        },
    ]);

    input.value = "";
});
