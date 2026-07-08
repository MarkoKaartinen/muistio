import type {
  QuartzComponent,
  QuartzComponentConstructor,
  QuartzComponentProps,
} from "../quartz/components/types"
import type { FullSlug, QuartzPluginData } from "@quartz-community/types"
import { htmlToJsx } from "../quartz/util/jsx"
import type { ComponentChildren } from "preact"
import type { Root } from "hast"
import { i18n } from "../quartz/i18n"
import GroupedPageList from "./GroupedPageList"

type TrieNode = {
  isFolder: boolean
  children: TrieNode[]
  data: unknown
  slug: string
  displayName: string
  findNode(path: string[]): TrieNode | undefined
}

type PageEntry = QuartzPluginData & Record<string, unknown>

function preferredDateTypeFromEntries(
  entries: PageEntry[],
): "created" | "modified" | "published" | undefined {
  for (const entry of entries) {
    if (entry.defaultDateType) {
      return entry.defaultDateType
    }
  }

  return undefined
}

function mostRecentDatesFromEntries(entries: PageEntry[]): PageEntry["dates"] {
  let maybeDates: PageEntry["dates"] | undefined
  for (const entry of entries) {
    if (entry.dates) {
      if (!maybeDates) {
        maybeDates = { ...entry.dates }
      } else {
        if (entry.dates.created > maybeDates.created) maybeDates.created = entry.dates.created
        if (entry.dates.modified > maybeDates.modified) maybeDates.modified = entry.dates.modified
        if (entry.dates.published > maybeDates.published)
          maybeDates.published = entry.dates.published
      }
    }
  }
  return maybeDates ?? { created: new Date(), modified: new Date(), published: new Date() }
}

function pagesFromTrie(folder: TrieNode): PageEntry[] {
  return folder.children
    .map((node) => {
      const nodeData = node.data as PageEntry | null
      if (nodeData) {
        if (nodeData.unlisted === true) return undefined
        return nodeData
      }

      if (node.isFolder) {
        const childEntries = node.children
          .map((child) => child.data as PageEntry | null)
          .filter((entry): entry is PageEntry => Boolean(entry && entry.unlisted !== true))
        const defaultDateType = preferredDateTypeFromEntries(childEntries)

        return {
          slug: node.slug as FullSlug,
          dates: mostRecentDatesFromEntries(childEntries),
          ...(defaultDateType ? { defaultDateType } : {}),
          frontmatter: { title: node.displayName, tags: [] },
        }
      }

      return undefined
    })
    .filter((page): page is PageEntry => page !== undefined)
}

const LocalFolderContent: QuartzComponent = (props: QuartzComponentProps) => {
  const { tree, fileData, cfg } = props
  const ctx = props.ctx as { trie?: TrieNode } | undefined
  const slug = (fileData as { slug?: string } | undefined)?.slug
  if (!slug) return null

  const folder = ctx?.trie?.findNode(slug.split("/"))
  if (!folder) return null

  const allPagesInFolder = pagesFromTrie(folder)
  const hastRoot = tree as Root
  const content =
    hastRoot.children.length === 0
      ? (fileData as { description?: unknown } | undefined)?.description
      : htmlToJsx(fileData.filePath as never, hastRoot)

  const pageListContent = GroupedPageList({
    ...props,
    allFiles: allPagesInFolder,
  }) as unknown as ComponentChildren

  return (
    <div class="popover-hint">
      <article>
        <div class="markdown-preview-view markdown-rendered">{content}</div>
      </article>
      <div class="page-listing">
        <p>
          {i18n(cfg.locale ?? "en-US").pages.folderContent.itemsUnderFolder({
            count: allPagesInFolder.length,
          })}
        </p>
        <div>{pageListContent}</div>
      </div>
    </div>
  )
}

LocalFolderContent.css = GroupedPageList.css

export default (() => LocalFolderContent) satisfies QuartzComponentConstructor
