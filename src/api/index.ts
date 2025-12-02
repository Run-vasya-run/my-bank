// src/api/index.ts — ИДЕАЛЬНЫЙ ОФФЛАЙН МОК (2025 хакатон-версия)
// Просто замени ВЕСЬ файл на это

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const bankApi = {
  // Авторизация — мгновенно
  login: async () => delay(400),
  register: async () => delay(400),
  getMe: async () => ({
    data: { full_name: "Айжан С.", phone: "+7 707 777 77 77" }
  }),

  // MFA — пропускаем
  generateMFA: async () => delay(300),
  verifyMFA: async () => delay(500),

  // Карты
  getCards: async () => ({
    data: [
      { id: 1, number: "4400 **** **** 1234", balance: 2850000, currency: "KZT", is_blocked: false },
      { id: 2, number: "5200 **** **** 5678", balance: 890000, currency: "KZT", is_blocked: false },
    ]
  }),

  createCard: async (currency: string = "KZT") => {
    await delay(1200);
    console.log("[MOCK] Создана новая карта:", currency);
    return { data: { success: true } };
  },

  blockCard: async (accountId: number) => {
    await delay(800);
    console.log("[MOCK] Карта заблокирована:", accountId);
    return { data: { success: true } };
  },

  unblockCard: async (accountId: number) => {
    await delay(800);
    console.log("[MOCK] Карта разблокирована:", accountId);
    return { data: { success: true } };
  },

  // Операции
  getHistory: async () => ({
    data: [
      { id: 1, amount: -12900, description: "Яндекс Такси", date: "2025-12-01" },
      { id: 2, amount: -8500, description: "Starbucks", date: "2025-11-30" },
      { id: 3, amount: 1500000, description: "Зарплата", date: "2025-11-25" },
    ]
  }),

  transferP2P: async (amount: number, to_phone?: string, to_card?: string) => {
    await delay(1000);
    console.log("[MOCK] P2P перевод:", amount, "на", to_phone || to_card);
    return { data: { success: true } };
  },

  // Сервисы
  payService: async (service_name: string, amount: number) => {
    await delay(1000);
    console.log(`[MOCK] Оплата услуги: ${service_name} — ${amount.toLocaleString()} ₸`);
    return { data: { success: true } };
  },

  // Кредит
  applyLoan: async (amount: number, term_months: number, income: number) => {
    await delay(1800);

    const isApproved = income >= amount * 0.25 || Math.random() > 0.3;

    if (isApproved) {
      const rate = (14 + Math.random() * 12).toFixed(1);
      console.log("[MOCK] Кредит одобрен под", rate + "%");
      return { data: { status: "approved", rate: rate + "%" } };
    } else {
      console.log("[MOCK] Кредит отклонён — недостаточный доход");
      throw new Error("Недостаточный доход");
    }
  },

  // ИИ Чат
  chatWithAI: async (message: string) => {
    await delay(1200);
    return {
      data: {
        response: `Ты написал: "${message}". Я — демо-ИИ, всё работает оффлайн!`
      }
    };
  },
};