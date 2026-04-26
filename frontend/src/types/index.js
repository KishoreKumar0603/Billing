/**
 * @typedef {"working" | "completed"} BillStatus
 */

/**
 * @typedef {"not_received" | "partially" | "received"} PaymentStatus
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [phone]
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} Customer
 * @property {string} _id
 * @property {string} name
 * @property {string} phone
 * @property {string} [address]
 * @property {string} [notes]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} BillRow
 * @property {string} label
 * @property {number} quantity
 * @property {number} rate
 * @property {number} [amount]
 */

/**
 * @typedef {Object} Bill
 * @property {string} _id
 * @property {string} billNumber
 * @property {Customer | string} customer
 * @property {string} lotNumber
 * @property {string} vehicleNumber
 * @property {string} fromName
 * @property {string} address
 * @property {BillRow[]} rows
 * @property {number} totalAmount
 * @property {number} receivedAmount
 * @property {number} balanceAmount
 * @property {BillStatus} status
 * @property {PaymentStatus} paymentStatus
 * @property {string} [notes]
 * @property {string} createdAt
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {Object} overview
 * @property {number} overview.totalOrders
 * @property {number} overview.completedOrders
 * @property {number} overview.workingOrders
 * @property {number} overview.totalRevenue
 * @property {number} overview.pendingPayments
 * @property {number} overview.totalBusinessAmount
 * @property {Object} today
 * @property {number} today.orders
 * @property {number} today.revenue
 */

/**
 * @typedef {Object} AnalyticsPoint
 * @property {string} label
 * @property {number} value
 */
