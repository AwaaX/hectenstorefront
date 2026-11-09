import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  filterParams,
}: {
  sortBy?: SortOptions
  page?: string
  filterParams?: { [key: string]: string | string[] | undefined }
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <PaginatedProducts
      sortBy={sort}
      page={pageNumber}
      filterParams={filterParams}
    />
  )
}

export default StoreTemplate
