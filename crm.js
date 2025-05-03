class Customer {
  constructor(customerId, name, email) {
    this.customerId = customerId;
    this.name = name;
    this.email = email;
    this.purchaseHistory = [];
  }

  addPurchase(amount) {
    this.purchaseHistory.push({ date: new Date(), amount });
  }

  totalSpent() {
    return this.purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
  }

  lastPurchaseDaysAgo() {
    if (!this.purchaseHistory.length) return null;
    const lastDate = this.purchaseHistory[this.purchaseHistory.length - 1].date;
    const diffTime = Math.abs(new Date() - lastDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
}

class CRM {
  constructor() {
    this.customers = new Map();
    this.nextId = 1;
  }

  addCustomer(name, email) {
    const id = this.nextId++;
    this.customers.set(id, new Customer(id, name, email));
    return id;
  }

  recordPurchase(customerId, amount) {
    const customer = this.customers.get(Number(customerId));
    if (customer) customer.addPurchase(Number(amount));
  }

  getVipCustomers(threshold = 1000) {
    return [...this.customers.values()].filter(
      (c) => c.totalSpent() >= threshold
    );
  }

  getInactiveCustomers(days = 30) {
    return [...this.customers.values()].filter((c) => {
      const daysAgo = c.lastPurchaseDaysAgo();
      return daysAgo !== null && daysAgo > days;
    });
  }

  sendEmail(customer, subject, message) {
    log(
      `📧 ${subject}<br>До: ${customer.email} — ${customer.name}<br>${message}`
    );
  }
}

const crm = new CRM();
const log = (msg) => {
  const output = document.getElementById('output');
  output.innerHTML = msg + '<hr>' + output.innerHTML;
};

function addCustomer() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  if (name && email) {
    const id = crm.addCustomer(name, email);
    log(`✅ Додано клієнта: ${name} (ID ${id})`);
  }
}

function recordPurchase() {
  const id = document.getElementById('purchaseId').value;
  const amount = document.getElementById('amount').value;
  crm.recordPurchase(id, amount);
  log(`💵 Покупка на $${amount} записана для клієнта ID ${id}`);
}

function showVIP() {
  const vips = crm.getVipCustomers();
  if (!vips.length) return log('😐 Немає VIP-клієнтів.');
  vips.forEach((c) => {
    log(`🌟 VIP: ${c.name} | Всього витрачено: $${c.totalSpent()}`);
  });
}

function sendPromotions() {
  const inactive = crm.getInactiveCustomers();
  if (!inactive.length) return log('✅ Усі клієнти активні.');
  inactive.forEach((c) => {
    crm.sendEmail(
      c,
      'Ми сумуємо за вами!',
      `${c.name}, отримайте -10% на наступну покупку!`
    );
  });
}
