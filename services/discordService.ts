import type { CartItem, OrderDetails } from '../types';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1434801508091695165/iDtPACGw7JOWWa458TBgQN7yvrJu9dlVGOAvgk8yk1XkYX80yt-VBZN_hbzqgNxlIJee';

export const sendOrderToDiscord = async (orderDetails: OrderDetails, items: CartItem[]): Promise<void> => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const description = items.map(item => `${item.quantity}x ${item.name}`).join('\n');

  const payload = {
    username: "Orderrred Bot",
    avatar_url: "https://github.com/qVelifox/Orderrred/blob/main/imgs/Orderrred%20Logo%20White%20Bg.png?raw=true",
    embeds: [
      {
        title: `New Order!`,
        color: 0xF97316, // Orange
        description: description,
        fields: [
          { name: 'Full Name', value: orderDetails.fullName, inline: true },
          { name: 'Contact', value: `\`${orderDetails.contactInfo}\``, inline: true },
          { name: 'Payment', value: orderDetails.paymentMethod, inline: true },
          { name: 'Total', value: `**${total.toFixed(2)}€**`, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: `New Order`,
        },
      },
    ],
  };

  const response = await fetch(DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error('Failed to send message to Discord:', response.statusText);
    throw new Error('Failed to send notification to Discord.');
  }
};