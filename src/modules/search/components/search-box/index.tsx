import { XMarkMini } from "@medusajs/icons"
import { FormEvent } from "react"

import SearchBoxWrapper, {
  ControlledSearchBoxProps,
} from "../search-box-wrapper"

const ControlledSearchBox = ({
  inputRef,
  onChange,
  onReset,
  onSubmit,
  placeholder,
  value,
  ...props
}: ControlledSearchBoxProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    if (onSubmit) {
      onSubmit(event)
    }

    if (inputRef.current) {
      inputRef.current.blur()
    }
  }

  const handleReset = (event: FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    onReset(event)

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div {...props} className="w-full">
      <form action="" noValidate onSubmit={handleSubmit} onReset={handleReset}>
        <div className="flex items-center justify-between">
          <input
            ref={inputRef}
            data-testid="search-input"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={placeholder}
            spellCheck={false}
            type="search"
            value={value}
            onChange={onChange}
            className="txt-compact-large w-full placeholder:text-gray-400 placeholder:transition-colors focus:outline-none bg-transparent border-none text-gray-900 search-input-no-clear"
          />
          {value && (
            <button
              onClick={handleReset}
              type="reset"
              className="flex-shrink-0 text-gray-500 hover:text-gray-700 focus:outline-none text-sm font-medium transition-colors duration-200"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

const SearchBox = () => {
  return (
    <SearchBoxWrapper>
      {(props) => {
        return (
          <>
            <ControlledSearchBox {...props} />
          </>
        )
      }}
    </SearchBoxWrapper>
  )
}

export default SearchBox
