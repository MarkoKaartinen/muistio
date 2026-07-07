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
import { getAllSegmentPrefixes, resolveRelative, simplifySlug } from "../quartz/util/path"
import GroupedPageList from "./GroupedPageList"

type PageFileData = QuartzPluginData & Record<string, unknown>

function isListed(file: PageFileData): boolean {
  return file.unlisted !== true
}

const LocalTagContent: QuartzComponent = (props: QuartzComponentProps) => {
  const { tree, fileData, allFiles, cfg } = props
  const fd = fileData as PageFileData
  const slug = fd.slug
  const locale = cfg.locale ?? "en-US"

  if (!(slug?.startsWith("tags/") || slug === "tags")) {
    throw new Error(`Component "LocalTagContent" tried to render a non-tag page: ${slug}`)
  }

  const tag = simplifySlug(slug.slice("tags/".length) as FullSlug)
  const allPagesWithTag = (t: string) =>
    (allFiles as PageFileData[])
      .filter(isListed)
      .filter((file) => (file.frontmatter?.tags ?? []).flatMap(getAllSegmentPrefixes).includes(t))

  const hastRoot = tree as Root
  const content =
    hastRoot.children.length === 0 ? fd.description : htmlToJsx(fd.filePath as never, hastRoot)

  if (tag === "/") {
    const tags = [
      ...new Set(
        (allFiles as PageFileData[])
          .filter(isListed)
          .flatMap((data) => data.frontmatter?.tags ?? [])
          .flatMap(getAllSegmentPrefixes),
      ),
    ].sort((a, b) => String(a).localeCompare(String(b)))

    return (
      <div class="popover-hint">
        <article>
          <div class="markdown-preview-view markdown-rendered">
            <p>{content}</p>
          </div>
        </article>
        <p>{i18n(locale).pages.tagContent.totalTags({ count: tags.length })}</p>
        <div>
          {tags.map((t) => {
            const pages = allPagesWithTag(t)
            const pageListContent = GroupedPageList({
              ...props,
              allFiles: pages,
              limit: 10,
            }) as unknown as ComponentChildren
            const href = resolveRelative(slug as FullSlug, `/tags/${String(t)}` as FullSlug)

            return (
              <div>
                <h2>
                  <a class="internal tag-link" href={href}>
                    {t}
                  </a>
                </h2>
                <div class="page-listing">
                  <p>{i18n(locale).pages.tagContent.itemsUnderTag({ count: pages.length })}</p>
                  {pageListContent}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const pages = allPagesWithTag(tag)
  const pageListContent = GroupedPageList({
    ...props,
    allFiles: pages,
  }) as unknown as ComponentChildren

  return (
    <div class="popover-hint">
      <article>
        <div class="markdown-preview-view markdown-rendered">{content}</div>
      </article>
      <div class="page-listing">
        <p>{i18n(locale).pages.tagContent.itemsUnderTag({ count: pages.length })}</p>
        <div>{pageListContent}</div>
      </div>
    </div>
  )
}

LocalTagContent.css = GroupedPageList.css

export default (() => LocalTagContent) satisfies QuartzComponentConstructor
