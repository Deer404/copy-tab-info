import { Storage } from "@plasmohq/storage"

export const DefaultOptions = {
  title: true,
  hostname: true,
  pathname: true,
  hash: true,
  params: true,
  protocol: true
}

export const COMMANDS = {
  COPY_TAB_INFO: "copy-tab-info",
  COPY_TAB_INFO_NO_PARAMS: "copy-tab-info-no-params",
  COPY_TAB_INFO_MARKDOWN: "copy-tab-info-markdown",
  COPY_TAB_INFO_CUSTOM: "copy-tab-info-custom"
}

export const ACTION_TYPES = {
  COPY_TAB_CUSTOM: "copyCustomFormat"
}

export const STORE_KEYS = "customOptions"

export const storage = new Storage()
