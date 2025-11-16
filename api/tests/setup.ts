import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const cdnRoot = path.join(__dirname, 'cdn')

process.env.BC_API_SECRET_KEY = process.env.BC_API_SECRET_KEY || 'test-secret'
process.env.BC_SMTP_HOST = process.env.BC_SMTP_HOST || 'smtp.test'
process.env.BC_SMTP_PORT = process.env.BC_SMTP_PORT || '587'
process.env.BC_SMTP_USER = process.env.BC_SMTP_USER || 'user'
process.env.BC_SMTP_PASS = process.env.BC_SMTP_PASS || 'pass'
process.env.BC_SMTP_FROM = process.env.BC_SMTP_FROM || 'no-reply@test'
process.env.BC_CDN_USERS = process.env.BC_CDN_USERS || path.join(cdnRoot, 'users')
process.env.BC_CDN_TEMP_USERS = process.env.BC_CDN_TEMP_USERS || path.join(cdnRoot, 'temp-users')
process.env.BC_CDN_CARS = process.env.BC_CDN_CARS || path.join(cdnRoot, 'cars')
process.env.BC_CDN_TEMP_CARS = process.env.BC_CDN_TEMP_CARS || path.join(cdnRoot, 'temp-cars')
process.env.BC_CDN_LOCATIONS = process.env.BC_CDN_LOCATIONS || path.join(cdnRoot, 'locations')
process.env.BC_CDN_USERS_API = process.env.BC_CDN_USERS_API || path.join(cdnRoot, 'api/users')
process.env.BC_CDN_CARS_API = process.env.BC_CDN_CARS_API || path.join(cdnRoot, 'api/cars')
process.env.BC_CDN_LOCATIONS_API = process.env.BC_CDN_LOCATIONS_API || path.join(cdnRoot, 'api/locations')
process.env.BC_CDN_TEMP_LOCATIONS = process.env.BC_CDN_TEMP_LOCATIONS || path.join(cdnRoot, 'temp-locations')
process.env.BC_CDN_CONTRACTS = process.env.BC_CDN_CONTRACTS || path.join(cdnRoot, 'contracts')
process.env.BC_CDN_TEMP_CONTRACTS = process.env.BC_CDN_TEMP_CONTRACTS || path.join(cdnRoot, 'temp-contracts')
process.env.BC_CDN_INVOICES = process.env.BC_CDN_INVOICES || path.join(cdnRoot, 'invoices')
process.env.BC_CDN_AGENCY_DOCS = process.env.BC_CDN_AGENCY_DOCS || path.join(cdnRoot, 'agency-docs')
process.env.BC_BACKEND_HOST = process.env.BC_BACKEND_HOST || 'http://localhost:3000'
process.env.BC_FRONTEND_HOST = process.env.BC_FRONTEND_HOST || 'http://localhost:3001'
process.env.BC_SMS_API_KEY = process.env.BC_SMS_API_KEY || 'sms-api-key'
process.env.BC_SMS_API_URL = process.env.BC_SMS_API_URL || 'https://sms.test/api'
process.env.BC_SMS_SENDER = process.env.BC_SMS_SENDER || 'TEST'
process.env.BC_INFO_EMAIL = process.env.BC_INFO_EMAIL || 'info@test'
process.env.BC_SMS_ACTIVE = process.env.BC_SMS_ACTIVE || 'false'
process.env.META_PIXEL_ID = process.env.META_PIXEL_ID || 'TEST_PIXEL_ID'
process.env.META_PIXEL_TOKEN = process.env.META_PIXEL_TOKEN || 'TEST_PIXEL_TOKEN'
process.env.META_API_VERSION = process.env.META_API_VERSION || 'v21.0'

export {}
