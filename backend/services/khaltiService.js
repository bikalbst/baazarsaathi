class KhaltiError extends Error {
  constructor(message, statusCode = 502, details = null) {
    super(message);
    this.name = 'KhaltiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

const getConfiguration = () => {
  const secretKey = process.env.KHALTI_SECRET_KEY;
  const baseUrl = (process.env.KHALTI_BASE_URL || 'https://dev.khalti.com/api/v2')
    .replace(/\/$/, '');

  if (!secretKey) {
    throw new KhaltiError('Khalti is not configured', 500);
  }

  return { secretKey, baseUrl };
};

const khaltiRequest = async (path, body) => {
  const { secretKey, baseUrl } = getConfiguration();
  let response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    throw new KhaltiError('Unable to reach Khalti payment service');
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new KhaltiError('Khalti returned an invalid response');
  }

  if (!response.ok) {
    throw new KhaltiError('Khalti rejected the payment request', 502, data);
  }

  return data;
};

const initiatePayment = async ({ order, buyer, listing }) => {
  const websiteUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const returnUrl = process.env.KHALTI_RETURN_URL || `${websiteUrl}/payment/callback`;

  return khaltiRequest('/epayment/initiate/', {
    return_url: returnUrl,
    website_url: websiteUrl,
    amount: Math.round(order.amount * 100),
    purchase_order_id: order._id.toString(),
    purchase_order_name: listing.title,
    customer_info: {
      name: buyer.name,
      email: buyer.email,
    },
  });
};

const lookupPayment = async (pidx) => khaltiRequest('/epayment/lookup/', { pidx });

module.exports = {
  KhaltiError,
  initiatePayment,
  lookupPayment,
};
