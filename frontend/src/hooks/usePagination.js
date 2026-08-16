import { useEffect, useMemo, useState } from 'react'

export function usePagination(items, itemsPerPage = 12) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / itemsPerPage)
  )

  // Si un filtre réduit le nombre de pages,
  // on revient automatiquement sur une page valide.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage

    return items.slice(start, end)
  }, [items, currentPage, itemsPerPage])

  const goToPage = (page) => {
    const validPage = Math.min(
      Math.max(page, 1),
      totalPages
    )

    setCurrentPage(validPage)
  }

  const nextPage = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    )
  }

  const previousPage = () => {
    setCurrentPage((prev) =>
      Math.max(prev - 1, 1)
    )
  }

  return {
    paginated,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
  }
}