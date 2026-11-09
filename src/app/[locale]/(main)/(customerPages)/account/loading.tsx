import Spinner from "@modules/common/icons/spinner"

export default function Loading() {
  return (
    <div className="flex h-full min-h-[320px] w-full items-center justify-center text-secondary">
      <Spinner size={32} />
    </div>
  )
}
