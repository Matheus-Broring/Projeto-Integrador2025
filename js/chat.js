import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://dtleskmrqtusfekwrmsk.supabase.co";
const SUPABASE_KEY = "sb_publishable_GCMe0MDqjp2pAwIl8OTNvw_Np9IPJ_I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let currentUserName = null;
let realtimeChannel = null;

const chatMessages = document.getElementById("chatMessages");
const connectionStatus = document.getElementById("connectionStatus");

// -------------------------
// Carregar usuário logado
// -------------------------
(async function loadUser() {
    const { data } = await supabase.auth.getUser();
    currentUser = data.user;

    if (!currentUser) {
        alert("Você precisa estar logado para usar o chat.");
        window.location.href = "login.html";
        return;
    }

    const { data: userData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", currentUser.id)
        .single();

    currentUserName = userData?.username || "Você";

    connectionStatus.innerHTML = `🟢 Logado como: ${currentUserName}`;

    await loadMessages();
    setupRealtime();
})();

// -------------------------
// Carregar mensagens
// -------------------------
async function loadMessages() {
    const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true });

    chatMessages.innerHTML = "";
    data?.forEach(msg => addMessageToDOM(msg));
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// -------------------------
// Adicionar mensagem 
// -------------------------
function addMessageToDOM(msg) {
    const div = document.createElement("div");
    div.classList.add("message");
    if (msg.user_id === currentUser.id) div.classList.add("own-message");

    const sender = msg.user_id === currentUser.id ? currentUserName : msg.sender_name || "Usuário";

    div.innerHTML = `
        <div class="message-user">
            ${sender}
            <span class="message-time">
                ${new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>  
        <div class="message-content">${msg.message}</div>
    `;

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// -------------------------
// Realtime 
function setupRealtime() {
    if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
    }

    realtimeChannel = supabase
        .channel("chat-realtime")
        .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "chat_messages" },
            payload => addMessageToDOM(payload.new)
        )
        .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "chat_messages" },
            () => loadMessages()
        )
        .subscribe();
}

// -------------------------
// Enviar mensagem
// -------------------------
document.getElementById("chatForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("messageInput");
    const text = input.value.trim();
    if (!text) return;

    await supabase.from("chat_messages").insert([
        {
            user_id: currentUser.id,
            sender_name: currentUserName,
            message: text
        }
    ]);

    input.value = "";
});

// -------------------------
// Limpar chat
// -------------------------
document.getElementById("clearChat").addEventListener("click", async () => {
    const confirmClear = confirm("Tem certeza que deseja limpar todo o chat?");
    if (!confirmClear) return;

    const { error } = await supabase
        .from("chat_messages")
        .delete()
        .neq("id", 0);

    if (!error) {
        chatMessages.innerHTML = "";
    }
});
