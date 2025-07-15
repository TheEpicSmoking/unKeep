import { FormControl, FormLabel, OutlinedInput } from '@mui/material'
import PasswordField from './PasswordField'

export default function FormField({ id, label, type = 'text', ...props }) {
    if (type === 'password') {
        return (
        <PasswordField id={id} {...props} />
        )
  } else {
        return (
        <FormControl fullWidth sx={{ mt: 2 }}>
        <FormLabel htmlFor={id}>{label}</FormLabel>
        <OutlinedInput
            id={id}
            type={type}
            name={id}
            {...props}
        />
        </FormControl>
    )
    }
}
