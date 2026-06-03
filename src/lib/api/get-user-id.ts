import { NextRequest } from 'next/server'

const DEFAULT_USER_ID = 'mindlife-user'

type MaybeBody = Record<string, unknown> | null | undefined

export function getUserId(searchParams: URLSearchParams, body?: MaybeBody): string {
  return (
    (body?.userId as string) ??
    searchParams.get('userId') ??
    DEFAULT_USER_ID
  )
}

export function extractUserId(request: NextRequest, body?: MaybeBody): string | Promise<string> {
  const { searchParams } = new URL(request.url)
  return getUserId(searchParams, body)
}

export function apiUserId(body?: MaybeBody): string {
  return body?.userId as string ?? DEFAULT_USER_ID
}
