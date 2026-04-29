/// <reference types="node" />
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import type { Database } from '../src/types/database'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
}

const supabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  { auth: { persistSession: false } }
)

async function main() {
  const email = process.env.SEED_EMAIL
  const password = process.env.SEED_PASSWORD

  if (!email || !password) {
    throw new Error('SEED_EMAIL and SEED_PASSWORD must be set in .env')
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    console.log(`User ${email} already exists — skipping`)
    return
  }

  const { error } = await supabase.from('users').insert({
    email,
    name: 'Brian',
    password_hash: passwordHash,
    role: 'admin',
  } as any)

  if (error) throw error

  console.log(`Seed complete: account created for ${email}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
