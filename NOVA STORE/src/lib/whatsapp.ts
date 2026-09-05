export function generateWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function generateAccountListingMessage(
  game: string, 
  details: string, 
  price: string, 
  sellerName: string, 
  sellerPhone: string
): string {
  return `مرحباً NOVA STORE,
أريد عرض حسابي للبيع:
- اللعبة: ${game}
- التفاصيل: ${details}
- السعر المطلوب: ${price}
- اسم البائع: ${sellerName}
- رقم البائع: ${sellerPhone}
`;
}

export function generateOrderMessage(
  orderNumber: string,
  gameName: string,
  packageName: string,
  price: string
): string {
  return `مرحباً NOVA STORE,
قمت بطلب شحن جديد:
- رقم الطلب: #${orderNumber}
- اللعبة: ${gameName}
- الباقة: ${packageName}
- السعر: ${price}
يرجى تأكيد الطلب.
`;
}
