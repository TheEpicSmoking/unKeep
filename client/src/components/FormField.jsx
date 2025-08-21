import { FormControl, FormLabel, OutlinedInput } from '@mui/material'
import PasswordField from './PasswordField'

export default function FormField({ id, label, type = 'text', ...props }) {
    if (type === 'password') {
        return (
        <PasswordField id={id} {...props} />
        )
  } else {
        return (
        <FormControl fullWidth sx={{ mt: 2, ...props.sx }}>
            <FormLabel htmlFor={id} sx={{ fontSize: '1.25rem', fontWeight: { xs: 400, md: 500 }}}>{label}</FormLabel>
            <OutlinedInput sx={{ borderRadius: 0 }}
                id={id}
                type={type}
                name={id}
                {...props}
            />
        </FormControl>
    )
    }
}
