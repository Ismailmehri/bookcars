import React, { useEffect, useRef, useState } from 'react'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material'
import { strings as commonStrings } from '@/lang/common'

import '@/assets/css/search.css'

interface SearchProps {
  className?: string
  onSubmit?: (value: string) => void
  initialValue?: string
  placeholder?: string
}

const Search = ({
  className,
  onSubmit,
  initialValue,
  placeholder,
}: SearchProps) => {
  const [keyword, setKeyword] = useState(initialValue ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setKeyword(initialValue ?? '')
  }, [initialValue])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault()

    if (onSubmit) {
      onSubmit(keyword)
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className={className}>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <input autoComplete="false" name="hidden" type="text" style={{ display: 'none' }} />
        <TextField
          inputRef={inputRef}
          variant="standard"
          value={keyword}
          onKeyDown={handleSearchKeyDown}
          onChange={handleSearchChange}
          placeholder={placeholder ?? commonStrings.SEARCH_PLACEHOLDER}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: keyword ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setKeyword('')
                      inputRef.current?.focus()
                    }}
                    aria-label={commonStrings.RESET}
                  >
                    <ClearIcon style={{ width: 20, height: 20 }} />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
          className="sc-search"
          id="search"
        />
        <IconButton type="submit">
          <SearchIcon />
        </IconButton>
      </form>
    </div>
  )
}

export default Search
