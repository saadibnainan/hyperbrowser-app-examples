import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const SITE_URL = Deno.env.get('SITE_URL') ?? ''

serve(async (req) => {
  const res = await fetch(`${SITE_URL}/api/crawl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })

  return new Response(await res.text(), { status: res.status })
}) 