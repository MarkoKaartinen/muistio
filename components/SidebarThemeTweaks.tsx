import type { QuartzComponent } from "../quartz/components/types"

const SidebarThemeTweaks: QuartzComponent = () => null

SidebarThemeTweaks.css = `
.page-header .breadcrumb-container + .article-title {
  margin-top: 0.6rem !important;
}

.right.sidebar > .toc,
.right.sidebar > .backlinks,
.right.sidebar > .recent-notes-local {
  width: 100%;
  margin: 0;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.backlinks > h3,
.recent-notes-local > h3,
button.toc-header h3 {
  margin: 0;
  font-size: 0.98rem !important;
  line-height: 1.2;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.backlinks > ul.overflow > li,
.recent-notes-local .section > .desc > h3 {
  margin: 0;
  font-size: 0.86rem !important;
  line-height: 1.3;
  font-weight: 600;
}

.backlinks > ul.overflow > li > a.internal,
.recent-notes-local .section > .desc > h3 > a.internal {
  background: transparent;
  padding: 0;
  border-radius: 0;
  line-height: inherit;
  color: var(--tertiary) !important;
}

.backlinks > ul.overflow > li > a.internal:hover {
  color: var(--dark);
}

.backlinks > ul.overflow {
  margin: 0.65rem 0 0;
  padding-left: 0 !important;
}

.recent-notes-local > ul.recent-ul {
  margin: 0.65rem 0 0;
  padding-left: 0 !important;
}

.backlinks > ul.overflow > li {
  margin: 0 0 0.6rem;
  padding-left: 0;
}

.recent-notes-local > ul.recent-ul > li {
  margin: 0 0 0.9rem;
}

ul.toc-content.overflow {
  margin-top: 0.65rem;
}

ul.toc-content.overflow > li > a {
  font-size: 0.94rem;
  line-height: 1.35;
}

.recent-notes-local .section {
  gap: 0.22rem;
}

.recent-notes-local .section > .meta {
  margin: 0;
  font-size: 0.74rem !important;
  line-height: 1.2;
  opacity: 0.58;
}
`

export default SidebarThemeTweaks
