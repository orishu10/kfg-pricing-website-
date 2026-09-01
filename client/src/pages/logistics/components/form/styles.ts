export const LABEL_SX = { fontSize: '0.66rem', fontWeight: 700, color: '#3a3a3a', mb: 0.25 } as const;

export const INPUT_SX = { bgcolor: '#fff', '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.75 } } as const;

export const gridSx = (cols: number, gap = 1.25) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols}, 1fr)`,
  gap,
});
