class PricePredictionError extends Error {
  constructor(message, statusCode = 503) {
    super(message);
    this.name = 'PricePredictionError';
    this.statusCode = statusCode;
  }
}

const predictPrice = async (listing) => {
  const serviceUrl = (process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  let response;

  try {
    response = await fetch(`${serviceUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    throw new PricePredictionError('Price prediction service is unavailable');
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    const invalidRequest = response.status === 422;
    throw new PricePredictionError(
      invalidRequest ? 'Listing details are not valid for prediction' : 'Unable to generate a price estimate',
      invalidRequest ? 400 : 503,
    );
  }

  return result.data;
};

module.exports = { predictPrice, PricePredictionError };
