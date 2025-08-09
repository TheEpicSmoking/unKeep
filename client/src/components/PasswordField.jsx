import { FormControl, FormLabel, OutlinedInput, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useState } from 'react'

export default function PasswordField({ id = 'password', value, onChange }) {
  const [show, setShow] = useState(false)

  return (
    <FormControl fullWidth sx={{ mt: 2 }}>
      <FormLabel htmlFor={id}>Password</FormLabel>
      <OutlinedInput
        id={id}
        type={show ? 'text' : 'password'}
        name={id}
        placeholder='********'
        value={value}
        onChange={onChange}
        endAdornment={
          value && (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                sx ={{ color: 'primary.main' }}
                onPointerDown={() => setShow(!show)}
              >
                {show ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          )
        }
      />
    </FormControl>
  )
}
