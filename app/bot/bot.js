const TelegramBot = require("node-telegram-bot-api");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const moment = require("moment-timezone");
require("moment-timezone/builds/moment-timezone-with-data");
require("dotenv").config();

const token = "6784235525:AAHu4VtmP-FhagO5pbaVJ_VeQn29lvoiHvg";

const supabaseUrl = "https://sqgifjezpzxplyvrrtev.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZ2lmamV6cHp4cGx5dnJydGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzNDc2NzQsImV4cCI6MjAyODkyMzY3NH0.2yYEUffqta76luZ5mUF0pwgWNx3iEonvmxxr1KJge68";
const options = { polling: true };
const supabase = createClient(supabaseUrl, supabaseKey);

const bot = new TelegramBot(token, options);

const commands = [
  { command: "start", description: "Greets the user" },
  {
    command: "listitem",
    description: "Displays available item and their prices",
  },
  { command: "pembayaran", description: "Pembayaran" },
  { command: "additem", description: "Add a new item (admin only)" },
  { command: "coin", description: "COIN ZEPETOBOT" },
];

async function deletePaymentDetails() {
  try {
    const { error } = await supabase
      .from("payment_details")
      .delete()
      .eq("some_column", "someValue");

    if (error) {
      console.error("Error deleting payment details:", error.message);
      // Handle error jika terjadi
    } else {
      console.log("Payment details deleted successfully.");
      // Tindakan setelah penghapusan berhasil
    }
  } catch (error) {
    console.error("Error deleting payment details:", error.message);
    // Handle error jika terjadi
  }
}

// Handler untuk perintah /start
bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Pesan sambutan saat pengguna menekan perintah /start
  const welcomeMessage =
    "Halo! Saya adalah bot Dakzy4uBot yang siap membantu Anda. Berikut adalah daftar perintah yang tersedia:\n";

  // Mendapatkan daftar perintah dari array commands
  const availableCommands = commands
    .map((command) => `/${command.command} - ${command.description}`)
    .join("\n");

  // Kirim pesan sambutan beserta daftar perintah
  bot.sendMessage(chatId, `${welcomeMessage}${availableCommands}`);
});

// Tabel format zepeto
const zepetoFormatTable = `
Format Zepeto:

SALIN DI BAWAH INI DENGAN BENAR

  ID ZPT: [Masukkan ID ZPT Anda di sini]
  Nama item: [Nama item yang anda order]
`;

let waitingForPaymentDetails = {};
let userStates = {};

// Fungsi untuk menangani pesan /pembayaran
bot.onText(/^\/pembayaran$/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  userStates[userId] = "waitingPayment";

  bot
    .sendMessage(
      chatId,
      "Silahkan lanjutkan pembayaran ke @Dakzy4uPayment\n\nLalu kirimkan screenshot Anda kesini"
    )
    .catch((error) => {
      if (error && error.message) {
        console.error("Error sending message to user:", error.message);
      } else {
        console.error(
          "Error object is undefined or does not have 'message' property."
        );
      }
    });
});

// Menangani pengiriman foto dari pengguna
bot.on("photo", async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const photo = msg.photo[0].file_id;

  // Kirim foto ke admin
  bot
    .sendPhoto(adminChatId, photo)
    .then(() => {
      // Beri tahu pengguna bahwa foto telah berhasil diteruskan ke admin
      bot
        .sendMessage(
          chatId,
          "Screenshot pembayaran Anda telah berhasil diteruskan ke admin\nharap menunggu balasan dari admin."
        )
        .catch((error) => {
          if (error && error.message) {
            console.error("Error sending message to user:", error.message);
          } else {
            console.error(
              "Error object is undefined or does not have 'message' property."
            );
          }
        });
    })
    .catch((error) => {
      if (error && error.message) {
        console.error("Error forwarding photo to admin:", error.message);
      } else {
        console.error(
          "Error object is undefined or does not have 'message' property."
        );
      }
      // Beri tahu pengguna jika terjadi kesalahan saat meneruskan foto ke admin
      bot
        .sendMessage(
          chatId,
          "Maaf, terjadi kesalahan dalam meneruskan screenshot pembayaran ke admin."
        )
        .catch((error) => {
          if (error && error.message) {
            console.error(
              "Error sending error message to user:",
              error.message
            );
          } else {
            console.error(
              "Error object is undefined or does not have 'message' property."
            );
          }
        });
    });
});

// Menangani kesalahan secara umum
bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

// Menangani kesalahan yang tidak tertangkap
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error.message);
});

// Menangani penanganan proses yang berhenti
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error.message);
});

// Tangani penanganan proses yang berhenti secara tiba-tiba
process.on("SIGINT", () => {
  console.log("Bot berhenti berjalan.");
  process.exit(1);
});

// Tangani pesan /diterima
bot.onText(/^\/diterima$/, async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  // Memeriksa apakah pengguna adalah admin
  if (isAdmin(userId)) {
    // Mengirim pesan meminta nama userid
    await bot.sendMessage(userId, "Silakan masukkan id user.");

    // Menunggu pesan balasan dari admin dengan id user
    bot.once("message", async (msg) => {
      const userId = msg.text; // Mendapatkan id user dari pesan admin

      // Mengirim pesan permintaan format kepada pengguna
      const promptMessage = `Lanjutkan dengan format:
Format Zepeto:

SALIN DI BAWAH INI DENGAN BENAR

  ID ZPT: [Masukkan ID ZPT Anda di sini]
  Nama item: [Nama item yang anda order]`;
      bot.sendMessage(userId, promptMessage);

      // Menetapkan pengguna ke mode pembayaran
      userStates[userId] = "waitingPayment:" + userId;
    });
  }
});

// Bot mendengarkan pesan
// Counter for incorrect format messages
let formatErrorMessageCount = 0;

bot.on("message", async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const text = msg.text;
  const username = msg.from.username || "default_username";

  // Checking if the user is waiting for payment
  if (userStates[userId] && userStates[userId].startsWith("waitingPayment")) {
    const waitingUserId = userStates[userId].split(":")[1];

    // Matching the ZPT ID and item names from the message
    const zptMatch = text.match(/ID ZPT: ([\w\d.-]+)\n?/);
    const itemsMatch = text.match(/Nama item: ([\w\d\s,.-]+)/);

    if (zptMatch && itemsMatch) {
      const zptId = zptMatch[1].trim();
      const itemsNames = itemsMatch[1]
        .trim()
        .split(",")
        .map((item) => item.trim());

      if (!zptId || !itemsNames.length) {
        return;
      }

      // Saving payment details to Supabase
      const dataToSave = {
        user_id: userId,
        zpt_id: zptId,
        item: itemsNames.join(", "),
        username: username,
        timestamp: new Date().toISOString(),
        terkirim: "belum dikirim",
      };

      try {
        const { data, error } = await supabase
          .from("payment_details")
          .insert(dataToSave);
        if (error) {
          console.error(
            "Error saving payment details to Supabase:",
            error.message
          );
          await bot.sendMessage(
            chatId,
            "Maaf, terjadi kesalahan dalam menyimpan detail pembayaran."
          );
        } else {
          await bot.sendMessage(
            chatId,
            "Detail pembayaran berhasil disimpan. Pembelian Anda sedang diproses dan akan dikirim dalam waktu 1x24 jam. Anda akan menerima pemberitahuan setelah proses pengiriman selesai."
          );
        }
      } catch (error) {
        console.error(
          "Error saving payment details to Supabase:",
          error.message
        );
        await bot.sendMessage(
          chatId,
          "Maaf, terjadi kesalahan dalam menyimpan detail pembayaran."
        );
      }

      delete userStates[waitingUserId];
    } else {
      // Sending format error message, limited to 2 times
      if (formatErrorMessageCount < 2) {
        await bot.sendMessage(
          chatId,
          "Format yang Anda masukkan salah. Silakan masukkan ulang format yang benar untuk ID ZPT dan nama item."
        );
        formatErrorMessageCount++;
      }
    }
  }
});

//list admin commands
// /additem  // kirimpesan

// Handler untuk command /kirimpesan
bot.onText(/^\/kirimpesan$/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Check if the user is an admin
  if (isAdmin(userId)) {
    bot.sendMessage(
      chatId,
      "Masukkan ID pengguna yang akan Anda kirimkan pesan."
    );

    // Menunggu ID pengguna dari admin
    bot.once("message", (msg) => {
      const targetUserId = msg.text;

      // Meminta pesan yang akan dikirimkan
      bot.sendMessage(chatId, "Masukkan pesan yang akan Anda kirimkan.");

      // Menunggu pesan dari admin
      bot.once("message", (msg) => {
        const messageToSend = msg.text;

        // Kirim pesan ke pengguna yang bersangkutan
        bot
          .sendMessage(targetUserId, messageToSend)
          .then(() => {
            // Konfirmasi kepada admin bahwa pesan telah berhasil dikirim
            bot.sendMessage(chatId, "Pesan berhasil dikirim.");
          })
          .catch((error) => {
            console.error("Error sending message:", error.message);
            bot.sendMessage(
              chatId,
              "Maaf, terjadi kesalahan dalam mengirim pesan."
            );
          });
      });
    });
  } else {
    bot.sendMessage(chatId, "You do not have permission to use this command.");
  }
});

// Function to handle messages and prevent spam
const userSpamCooldown = {}; // Store the last message timestamp of each user

bot.on("message", (msg) => {
  const userId = msg.from.id;
  const currentTime = new Date().getTime();

  // Check if the user has sent a message before
  if (
    userSpamCooldown[userId] &&
    currentTime - userSpamCooldown[userId] < 3000
  ) {
    // If yes, inform the user not to spam
    bot.sendMessage(
      userId,
      "Please wait a moment before sending the next message."
    );
    return;
  }

  // Store the last message timestamp of the user
  userSpamCooldown[userId] = currentTime;
});

bot
  .setMyCommands(commands)
  .then(() => console.log("Commands set successfully!"))
  .catch((error) => console.error("Error setting commands:", error.message));
const adminIds = ["1722091990"];
function isAdmin(userId) {
  return adminIds.includes(userId.toString());
}
const adminChatId = "1722091990";

// Function to forward messages from users to the admin
bot.on("message", (msg) => {
  // Check if the message is from a user (not from the admin)
  if (msg.from.id.toString() !== adminChatId) {
    // Get the current time in Indonesia timezone
    const currentTime = moment().tz("Asia/Jakarta").format("HH:mm:ss");

    // Prepare the message content with user's username, timestamp, and text
    const messageContent = `Message from user: \nUser ID: ${msg.from.id}, \nUsername: ${msg.from.username}, \nTime: ${currentTime}\nMessage Content: ${msg.text}`;

    // Forward the message to the admin
    bot.sendMessage(adminChatId, messageContent);

    // Log the user format and message
    console.log("Message from user:");
    console.log("User ID:", msg.from.id);
    console.log("Username:", msg.from.username);
    console.log("Time:", currentTime);
    console.log("Message Content:", msg.text);
  }
});

// Handler untuk command /additem
bot.onText(/^\/additem$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Periksa apakah pengguna adalah admin
  if (isAdmin(userId)) {
    const response = "Please enter the item details (name, price)";
    bot.sendMessage(chatId, response);

    // Mendengarkan pesan dari pengguna untuk mendapatkan detail item
    const messageListener = async (msg) => {
      if (msg.text) {
        const itemDetails = msg.text.split(","); // Pisahkan pesan dengan koma untuk mendapatkan detail item
        if (itemDetails.length === 2) {
          // Pastikan semua detail diberikan
          const [name, price] = itemDetails;

          // Masukkan detail item ke dalam Supabase
          try {
            const { data, error } = await supabase
              .from("item")
              .insert([{ name, price }]);
            if (error) {
              console.error("Error adding item to Supabase:", error.message);
              bot.sendMessage(
                chatId,
                "Maaf, terjadi kesalahan saat menambahkan item."
              );
            } else {
              bot.sendMessage(chatId, "Item added successfully.");
            }
          } catch (error) {
            console.error("Error adding item to Supabase:", error.message);
            bot.sendMessage(
              chatId,
              "Maaf, terjadi kesalahan saat menambahkan item."
            );
          }

          // Hentikan mendengarkan pesan setelah menerima satu
          bot.removeListener("message", messageListener);
        } else {
          bot.sendMessage(
            chatId,
            "Format pesan tidak valid. Mohon masukkan detail item dengan format: nama, harga."
          );
        }
      }
    };

    // Tambahkan listener pesan
    bot.on("message", messageListener);

    // Hapus listener pesan setelah 1 menit
    setTimeout(() => {
      bot.removeListener("message", messageListener);
    }, 60000); // 1 menit dalam milidetik
  } else {
    const response = "You do not have permission to add a new item.";
    bot.sendMessage(chatId, response);
  }
});

bot.onText(/^\/listitem$/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const { data, error } = await supabase.from("item").select("*");
    if (error) {
      console.error("Error retrieving items from Supabase:", error.message);
      bot.sendMessage(
        chatId,
        "Maaf, terjadi kesalahan dalam mengambil data item."
      );
      return;
    }

    if (!data || data.length === 0) {
      bot.sendMessage(
        chatId,
        "Belum ada item tersedia. Silahkan tunggu admin menambahkannya."
      );
      return;
    }

    data.forEach(async (item) => {
      const itemMessage = `${item.name}\nHarga: ${item.price}\npict: ${item.photopath}`;
      bot.sendMessage(chatId, itemMessage);
    });
  } catch (error) {
    console.error("Error retrieving items from Supabase:", error.message);
    bot.sendMessage(
      chatId,
      "Maaf, terjadi kesalahan dalam mengambil data item."
    );
  }
});

async function checkSentOrders() {
  console.log("Checking sent orders...");
  try {
    const { data: sentOrders, error: orderError } = await supabase
      .from("payment_details")
      .select("*")
      .eq("terkirim", "sudah dikirim")
      .eq("notification_sent", false);

    if (orderError) {
      throw new Error(orderError.message);
    }

    for (const order of sentOrders) {
      // Kirim pesan langsung ke pengguna bahwa pesanan telah dikirim
      console.log(
        `Sending notification to user ${order.user_id} for order ${order.item}`
      );
      await bot.sendMessage(
        order.user_id,
        `Pesanan Anda untuk item ${order.item} sudah kami kirim dengan id zepeto ${order.zpt_id}`
      );
      await supabase
        .from("payment_details")
        .update({ notification_sent: true })
        .eq("id", order.id);
    }
    console.log("Notification sent to all users.");
  } catch (error) {
    console.error("Error checking and sending orders:", error.message);
  }
}

setInterval(checkSentOrders, 100000);

bot.onText(/^\/coin$/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const { data, error } = await supabase.from("coin").select("*");
    if (error) {
      console.error("Error retrieving data from Supabase:", error.message);
      bot.sendMessage(chatId, "Maaf, terjadi kesalahan dalam mengambil data.");
      return;
    }

    if (!data || data.length === 0) {
      bot.sendMessage(
        chatId,
        "Belum ada coin tersedia. Silahkan tunggu admin menambahkannya."
      );
      return;
    }

    data.forEach(async (row) => {
      const message = `Harga: ${row.harga}\nKoin Tersedia: ${row.koin_tersedia}`;
      bot.sendMessage(chatId, message);
    });
  } catch (error) {
    console.error("Error retrieving data from Supabase:", error.message);
    bot.sendMessage(chatId, "Maaf, terjadi kesalahan dalam mengambil data.");
  }
});

deletePaymentDetails();
console.log("Bot is running. Send a message to start!");
