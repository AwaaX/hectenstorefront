"use client"

import React, { useState } from "react"
import { useTranslations } from "next-intl"

type ReadMoreProps = {
  children: React.ReactNode
  /** Number of words shown while collapsed */
  words?: number
  className?: string
  buttonClassName?: string
}

type Budget = { left: number; suffix: React.ReactNode; placed: boolean }

/**
 * Walks the node tree and keeps only the first `budget.left` words,
 * preserving element wrappers (<p>, <strong>, ...). The suffix (ellipsis +
 * button) is placed inside the innermost element holding the last kept word,
 * so it stays inline with the text instead of dropping to a new line.
 */
const truncateNode = (
  node: React.ReactNode,
  budget: Budget
): { node: React.ReactNode; truncated: boolean } => {
  const withSuffix = (n: React.ReactNode) => {
    if (budget.placed) return n
    budget.placed = true
    return (
      <>
        {n}
        {budget.suffix}
      </>
    )
  }

  if (budget.left <= 0) return { node: null, truncated: true }

  if (typeof node === "string" || typeof node === "number") {
    const tokens = String(node).split(/(\s+)/) // keeps whitespace tokens
    let out = ""
    for (const tok of tokens) {
      if (!tok) continue
      if (/^\s+$/.test(tok)) {
        out += tok
        continue
      }
      if (budget.left <= 0)
        return { node: withSuffix(out.trimEnd()), truncated: true }
      out += tok
      budget.left--
    }
    return { node: out, truncated: false }
  }

  if (
    Array.isArray(node) ||
    (React.isValidElement(node) && node.type === React.Fragment)
  ) {
    const list = Array.isArray(node) ? node : (node as any).props.children
    const result: React.ReactNode[] = []
    let truncated = false
    React.Children.toArray(list).forEach((child, i) => {
      if (truncated) return
      const r = truncateNode(child, budget)
      // Rebuilt nodes (suffix/array fragments) carry no key, so key each slot here
      if (r.node !== null)
        result.push(<React.Fragment key={i}>{r.node}</React.Fragment>)
      if (r.truncated) truncated = true
    })
    // Budget ran out exactly at a child boundary: attach to the last kept child's parent
    return {
      node: (
        <>
          {result}
          {truncated && withSuffix(null)}
        </>
      ),
      truncated,
    }
  }

  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<any>
    const r = truncateNode(el.props.children, budget)
    return {
      node: React.cloneElement(el, undefined, r.node),
      truncated: r.truncated,
    }
  }

  return { node: null, truncated: false }
}

const ReadMore = ({
  children,
  words = 50,
  className,
  buttonClassName = "underline font-medium mb-8 text-[16px]",
}: ReadMoreProps) => {
  const t = useTranslations("Common.ReadMore")
  const [expanded, setExpanded] = useState(false)

  const toggle = (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      aria-expanded={expanded}
      className={buttonClassName}
    >
      {expanded ? t("readLess") : t("readMore")}
    </button>
  )

  const { node: preview, truncated } = truncateNode(children, {
    left: words,
    suffix: <>… {toggle}</>,
    placed: false,
  })

  if (!truncated) return <div className={className}>{children}</div>

  return (
    <div className={className}>
      {expanded ? children : preview}
      {expanded && <> {toggle}</>}
    </div>
  )
}

export default ReadMore
