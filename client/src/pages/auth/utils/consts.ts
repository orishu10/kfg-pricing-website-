export const inputSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    bgcolor: '#fff !important',
    borderRadius: 1,
    '& fieldset': { borderColor: '#bbb', borderRadius: 1 },
    '&:hover fieldset': { borderColor: '#888' },
    '&.Mui-focused fieldset': { borderColor: '#555' },
  },
  '& .MuiInputBase-input': { color: '#111', py: 1.2, px: 1.5 },
  '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
    WebkitBoxShadow: '0 0 0 1000px #fff inset',
    WebkitTextFillColor: '#111',
    transition: 'background-color 5000s ease-in-out 0s',
  },
} as const;
