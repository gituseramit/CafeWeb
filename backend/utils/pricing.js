const pool = require('../config/database');

const calculateOrderTotal = async (items) => {
  let subtotal = 0;
  const calculatedItems = [];

  for (const item of items) {
    const serviceResult = await pool.query('SELECT * FROM services WHERE id = $1', [item.service_id]);
    
    if (serviceResult.rows.length === 0) {
      throw new Error(`Service ${item.service_id} not found`);
    }

    const service = serviceResult.rows[0];
    const quantity = parseFloat(item.quantity) || 1;
    
    // Determine price (use base_price, or range if specified)
    let unitRate = parseFloat(service.base_price);
    if (service.min_price && service.max_price && item.price_override) {
      const overridePrice = parseFloat(item.price_override);
      if (overridePrice >= parseFloat(service.min_price) && overridePrice <= parseFloat(service.max_price)) {
        unitRate = overridePrice;
      }
    }

    const itemSubtotal = unitRate * quantity;
    subtotal += itemSubtotal;

    calculatedItems.push({
      ...item,
      service,
      unit_rate: unitRate,
      subtotal: itemSubtotal
    });
  }

  return { subtotal, items: calculatedItems };
};

const applyCharges = async (subtotal) => {
  // Get settings
  const taxResult = await pool.query(
    "SELECT value FROM settings WHERE key = 'tax_percentage'"
  );
  const serviceChargeResult = await pool.query(
    "SELECT value FROM settings WHERE key = 'service_charge'"
  );

  const taxPercentage = taxResult.rows[0]?.value?.value || 0;
  const serviceCharge = parseFloat(serviceChargeResult.rows[0]?.value?.value || 0);

  const taxAmount = (subtotal * taxPercentage) / 100;
  const total = subtotal + taxAmount + serviceCharge;

  return {
    subtotal,
    tax_percentage: taxPercentage,
    tax_amount: taxAmount,
    service_charge: serviceCharge,
    total
  };
};

module.exports = { calculateOrderTotal, applyCharges };

