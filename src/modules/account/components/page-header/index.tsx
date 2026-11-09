import React from "react"

type AccountPageHeaderProps = {
  title: string
  description?: string
  action?: React.ReactNode
}

const AccountPageHeader = ({
  title,
  description,
  action,
}: AccountPageHeaderProps) => {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 small:flex-row small:items-end small:justify-between">
      <div className="flex max-w-2xl flex-col gap-y-1.5">
        <h1 className="text-[26px] font-semibold leading-tight text-black">
          {title}
        </h1>
        {description && (
          <p className="text-[15px] leading-6 text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export default AccountPageHeader
