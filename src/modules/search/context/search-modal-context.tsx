"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type SearchModalContextType = {
  isOpen: boolean
  open: () => void
  close: () => void
}

const SearchModalContext = createContext<SearchModalContextType | undefined>(undefined)

export const SearchModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <SearchModalContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </SearchModalContext.Provider>
  )
}

export const useSearchModal = () => {
  const context = useContext(SearchModalContext)
  if (!context) {
    throw new Error("useSearchModal must be used within SearchModalProvider")
  }
  return context
}
