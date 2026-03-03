import { DefaultOptions, type OptionType } from "~constant/index"

export type TabInfo = {
  title: string
  url: string
  urlNoParams: string
  protocol: string
  hash: string
  hostname: string
  pathname: string
  params: string
}

export function getTabInfoFromTab(
  tab?: Pick<chrome.tabs.Tab, "title" | "url"> | null
): TabInfo | null {
  if (!tab?.url) {
    return null
  }

  try {
    const parsedUrl = new URL(tab.url)

    return {
      title: tab.title ?? "",
      url: parsedUrl.href,
      urlNoParams: `${parsedUrl.origin}${parsedUrl.pathname}`,
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      pathname: parsedUrl.pathname,
      hash: parsedUrl.hash,
      params: parsedUrl.search
    }
  } catch {
    return null
  }
}

export function resolveCustomOptions(
  options?: Partial<OptionType> | null
): OptionType {
  return {
    ...DefaultOptions,
    ...(options ?? {})
  }
}

export function formatFullTabInfo(tabInfo: TabInfo): string {
  return `${tabInfo.title}\n${tabInfo.url}`
}

export function formatMarkdownTabInfo(tabInfo: TabInfo): string {
  return `[${tabInfo.title}](${tabInfo.url})`
}

export function formatCustomTabInfo(
  tabInfo: TabInfo,
  options?: Partial<OptionType> | null,
  includeTitle = true
): string {
  const resolvedOptions = resolveCustomOptions(options)
  const parts: string[] = []

  if (resolvedOptions.protocol) {
    parts.push(`${tabInfo.protocol}//`)
  }

  if (resolvedOptions.hostname) {
    parts.push(tabInfo.hostname)
  }

  if (resolvedOptions.pathname) {
    parts.push(tabInfo.pathname)
  }

  if (resolvedOptions.params) {
    parts.push(tabInfo.params)
  }

  if (resolvedOptions.hash) {
    parts.push(tabInfo.hash)
  }

  if (resolvedOptions.title && includeTitle) {
    return `${tabInfo.title}\n${parts.join("")}`
  }

  return parts.join("")
}
